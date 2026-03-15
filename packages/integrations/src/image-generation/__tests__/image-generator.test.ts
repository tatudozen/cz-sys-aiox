/**
 * Image Generator Tests — Story 4.3
 * AC-7: mock provider → generate → validate result structure
 */

import { describe, it, expect, vi } from 'vitest';
import { MockImageProvider, FallbackImageGenerator, createImageGenerator } from '../factory.js';
import type { ImageGenerator, ImageOptions, ImageResult, StorageClient } from '../types.js';

// Mock storage client for testing
function createMockStorageClient(): StorageClient {
  return {
    from: (_bucket: string) => ({
      upload: vi.fn().mockResolvedValue({
        data: { path: 'images/test.png' },
        error: null,
      }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://storage.test/assets/images/test.png' },
      }),
    }),
  };
}

describe('MockImageProvider', () => {
  it('generates result with all required fields', async () => {
    const provider = new MockImageProvider();
    const result = await provider.generate('Test prompt');

    expect(result).toHaveProperty('provider_url');
    expect(result).toHaveProperty('storage_url');
    expect(result).toHaveProperty('width');
    expect(result).toHaveProperty('height');
    expect(result).toHaveProperty('generation_id');
  });

  it('returns 1024x1024 by default', async () => {
    const provider = new MockImageProvider();
    const result = await provider.generate('prompt');

    expect(result.width).toBe(1024);
    expect(result.height).toBe(1024);
  });

  it('accepts custom mock result', async () => {
    const provider = new MockImageProvider({ generation_id: 'custom-id-123' });
    const result = await provider.generate('prompt');

    expect(result.generation_id).toBe('custom-id-123');
  });

  it('provider name is mock', () => {
    const provider = new MockImageProvider();
    expect(provider.providerName).toBe('mock');
  });
});

describe('FallbackImageGenerator', () => {
  it('returns primary result when primary succeeds', async () => {
    const primary: ImageGenerator = {
      providerName: 'primary',
      generate: vi.fn().mockResolvedValue({ generation_id: 'primary-123' } as ImageResult),
    };
    const fallback: ImageGenerator = {
      providerName: 'fallback',
      generate: vi.fn().mockResolvedValue({ generation_id: 'fallback-456' } as ImageResult),
    };

    const generator = new FallbackImageGenerator(primary, fallback);
    const result = await generator.generate('prompt');

    expect(result.generation_id).toBe('primary-123');
    expect(fallback.generate).not.toHaveBeenCalled();
  });

  it('falls back when primary fails', async () => {
    const primary: ImageGenerator = {
      providerName: 'primary',
      generate: vi.fn().mockRejectedValue(new Error('Primary failed')),
    };
    const fallback: ImageGenerator = {
      providerName: 'fallback',
      generate: vi.fn().mockResolvedValue({ generation_id: 'fallback-456' } as ImageResult),
    };

    const generator = new FallbackImageGenerator(primary, fallback);
    const result = await generator.generate('prompt');

    expect(result.generation_id).toBe('fallback-456');
  });

  it('throws if both primary and fallback fail', async () => {
    const primary: ImageGenerator = {
      providerName: 'primary',
      generate: vi.fn().mockRejectedValue(new Error('Primary failed')),
    };
    const fallback: ImageGenerator = {
      providerName: 'fallback',
      generate: vi.fn().mockRejectedValue(new Error('Fallback also failed')),
    };

    const generator = new FallbackImageGenerator(primary, fallback);
    await expect(generator.generate('prompt')).rejects.toThrow('Fallback also failed');
  });

  it('provider name combines both providers', () => {
    const primary = new MockImageProvider();
    const fallback = new MockImageProvider();
    const generator = new FallbackImageGenerator(primary, fallback);

    expect(generator.providerName).toBe('mock+mock');
  });
});

describe('createImageGenerator', () => {
  it('returns MockImageProvider for "mock" provider', () => {
    const generator = createImageGenerator('mock');
    expect(generator.providerName).toBe('mock');
  });

  it('returns MockImageProvider when no provider specified and no env var', () => {
    const originalEnv = process.env.IMAGE_PROVIDER;
    delete process.env.IMAGE_PROVIDER;

    const generator = createImageGenerator();
    expect(generator.providerName).toBe('mock');

    if (originalEnv !== undefined) process.env.IMAGE_PROVIDER = originalEnv;
  });

  it('throws for nano-banana without API key', () => {
    const storageClient = createMockStorageClient();
    const originalKey = process.env.NANO_BANANA_API_KEY;
    delete process.env.NANO_BANANA_API_KEY;

    expect(() => createImageGenerator('nano-banana', storageClient)).toThrow('NANO_BANANA_API_KEY');

    if (originalKey !== undefined) process.env.NANO_BANANA_API_KEY = originalKey;
  });
});

describe('MockImageProvider — download to storage integration', () => {
  it('generates with options and returns valid structure', async () => {
    const provider = new MockImageProvider();
    const options: ImageOptions = {
      aspect_ratio: '16:9',
      style_preset: 'photorealistic',
    };
    const result = await provider.generate('Brand-consistent hero image', options);

    expect(typeof result.provider_url).toBe('string');
    expect(typeof result.storage_url).toBe('string');
    expect(result.generation_id).toBeTruthy();
  });
});
