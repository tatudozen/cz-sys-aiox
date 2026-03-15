/**
 * Image Generator Factory — with automatic fallback
 * Story 4.3 — AC-2
 */

import { NanaBananaProvider } from './providers/nano-banana.js';
import { KlingAIProvider } from './providers/kling-ai.js';
import type { ImageGenerator, ImageOptions, ImageResult, StorageClient } from './types.js';

export type ImageProviderName = 'nano-banana' | 'kling-ai' | 'mock';

/**
 * Mock provider for testing (AC-7)
 */
export class MockImageProvider implements ImageGenerator {
  readonly providerName = 'mock';

  constructor(private readonly mockResult?: Partial<ImageResult>) {}

  async generate(prompt: string, _options: ImageOptions = {}): Promise<ImageResult> {
    return {
      provider_url: `https://mock.example.com/images/${Date.now()}.png`,
      storage_url: `https://storage.supabase.co/assets/images/mock-${Date.now()}.png`,
      width: 1024,
      height: 1024,
      generation_id: `mock-${Date.now()}`,
      ...this.mockResult,
    };
  }
}

/**
 * Wrapper that automatically retries with fallback provider
 * AC-2: if Nano Banana fails → try Kling AI
 */
export class FallbackImageGenerator implements ImageGenerator {
  readonly providerName: string;

  constructor(
    private readonly primary: ImageGenerator,
    private readonly fallback: ImageGenerator,
  ) {
    this.providerName = `${primary.providerName}+${fallback.providerName}`;
  }

  async generate(prompt: string, options: ImageOptions = {}): Promise<ImageResult> {
    try {
      return await this.primary.generate(prompt, options);
    } catch (primaryError) {
      console.warn(
        `[ImageGenerator] Primary provider "${this.primary.providerName}" failed: ${String(primaryError)}. Trying fallback "${this.fallback.providerName}"...`,
      );
      return this.fallback.generate(prompt, options);
    }
  }
}

/**
 * Factory function — creates provider with fallback
 * AC-2: configurable via IMAGE_PROVIDER env var
 */
export function createImageGenerator(
  provider?: ImageProviderName,
  storageClient?: StorageClient,
  storagePath?: string,
): ImageGenerator {
  const selectedProvider = provider ?? (process.env.IMAGE_PROVIDER as ImageProviderName) ?? 'mock';

  if (selectedProvider === 'mock') {
    return new MockImageProvider();
  }

  if (!storageClient) {
    throw new Error('storageClient is required for non-mock providers');
  }

  const nanoBananaKey = process.env.NANO_BANANA_API_KEY;
  const klingAiKey = process.env.KLING_AI_API_KEY;
  const path = storagePath ?? 'images';

  if (selectedProvider === 'nano-banana') {
    if (!nanoBananaKey) throw new Error('NANO_BANANA_API_KEY is not configured');
    const primary = new NanaBananaProvider(nanoBananaKey, storageClient, path);

    if (klingAiKey) {
      // Auto-fallback to Kling AI if available
      const fallback = new KlingAIProvider(klingAiKey, storageClient, path);
      return new FallbackImageGenerator(primary, fallback);
    }

    return primary;
  }

  if (selectedProvider === 'kling-ai') {
    if (!klingAiKey) throw new Error('KLING_AI_API_KEY is not configured');
    return new KlingAIProvider(klingAiKey, storageClient, path);
  }

  return new MockImageProvider();
}
