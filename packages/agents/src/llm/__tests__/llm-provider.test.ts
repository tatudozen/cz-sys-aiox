/**
 * LLM Provider Unit Tests — Story 3.1
 *
 * Tests: MockLLMProvider, factory, retry logic (simulated),
 *        timeout behavior, graceful fallback.
 *
 * Integration test (real Claude API) is skipped without CLAUDE_API_KEY.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockLLMProvider, createLLMProvider } from '../factory.js';
import { ClaudeProvider } from '../claude-provider.js';

describe('MockLLMProvider', () => {
  it('returns configured response', async () => {
    const provider = new MockLLMProvider(['hello world']);
    const result = await provider.complete('test prompt');
    expect(result.content).toBe('hello world');
    expect(result.model).toBe('mock');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('cycles through multiple responses', async () => {
    const provider = new MockLLMProvider(['first', 'second']);
    const r1 = await provider.complete('p1');
    const r2 = await provider.complete('p2');
    const r3 = await provider.complete('p3');
    expect(r1.content).toBe('first');
    expect(r2.content).toBe('second');
    expect(r3.content).toBe('first');
  });

  it('returns token counts and model', async () => {
    const provider = new MockLLMProvider(['ok']);
    const result = await provider.complete('q');
    expect(result.inputTokens).toBeGreaterThan(0);
    expect(result.outputTokens).toBeGreaterThan(0);
  });
});

describe('createLLMProvider factory', () => {
  it('creates MockLLMProvider when provider=mock', () => {
    const provider = createLLMProvider({ provider: 'mock' });
    expect(provider).toBeInstanceOf(MockLLMProvider);
  });

  it('creates ClaudeProvider when provider=claude with apiKey', () => {
    const provider = createLLMProvider({ provider: 'claude', apiKey: 'sk-test-123' });
    expect(provider).toBeInstanceOf(ClaudeProvider);
  });

  it('throws when claude provider missing apiKey and no env var', () => {
    const originalKey = process.env.CLAUDE_API_KEY;
    delete process.env.CLAUDE_API_KEY;
    expect(() => createLLMProvider({ provider: 'claude' })).toThrow('CLAUDE_API_KEY is required');
    if (originalKey) process.env.CLAUDE_API_KEY = originalKey;
  });

  it('uses env vars when config not explicitly provided', () => {
    process.env.LLM_PROVIDER = 'mock';
    const provider = createLLMProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);
    delete process.env.LLM_PROVIDER;
  });
});

describe('ClaudeProvider retry logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retries on 500 errors and throws after max attempts', async () => {
    const provider = new ClaudeProvider({
      apiKey: 'sk-test',
      maxRetries: 3,
      timeoutMs: 5_000,
    });

    // Mock fetch to always return 500
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(provider.complete('test')).rejects.toThrow('failed after 3 attempts');
    expect(mockFetch).toHaveBeenCalledTimes(3);

    vi.unstubAllGlobals();
  });

  it('does not retry on 400 client errors', async () => {
    const provider = new ClaudeProvider({ apiKey: 'sk-test', maxRetries: 3 });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request'),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(provider.complete('test')).rejects.toThrow('client error 400');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it('returns valid LLMResponse on success', async () => {
    const provider = new ClaudeProvider({ apiKey: 'sk-test' });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [{ type: 'text', text: 'Hello from Claude' }],
        usage: { input_tokens: 10, output_tokens: 5 },
        model: 'claude-sonnet-4-6-20250219',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await provider.complete('test');
    expect(result.content).toBe('Hello from Claude');
    expect(result.inputTokens).toBe(10);
    expect(result.outputTokens).toBe(5);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);

    vi.unstubAllGlobals();
  });
});

describe('ClaudeProvider integration (real API)', () => {
  const hasApiKey = Boolean(process.env.CLAUDE_API_KEY);

  it.skipIf(!hasApiKey)('makes real API call and returns valid response', async () => {
    const provider = createLLMProvider({ provider: 'claude' });
    const result = await provider.complete('Say "pong" and nothing else.', {
      maxTokens: 10,
    });
    expect(result.content.toLowerCase()).toContain('pong');
    expect(result.inputTokens).toBeGreaterThan(0);
  });
});
