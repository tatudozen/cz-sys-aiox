/**
 * LLM Provider Factory
 * Story 3.1 — AC-3: createLLMProvider factory extensible for future providers
 */

import { ClaudeProvider } from './claude-provider.js';
import type { LLMProvider, LLMProviderConfig } from './types.js';

/**
 * Mock provider for unit tests — returns configurable responses without API calls.
 */
export class MockLLMProvider implements LLMProvider {
  private responses: string[];
  private callCount = 0;

  constructor(responses: string[] = ['mock response']) {
    this.responses = responses;
  }

  async complete(_prompt: string) {
    const response = this.responses[this.callCount % this.responses.length];
    this.callCount++;
    return {
      content: response,
      inputTokens: 100,
      outputTokens: 50,
      model: 'mock',
      latencyMs: 1,
    };
  }
}

/**
 * Create an LLM provider from config.
 * Defaults to env vars if config values not explicitly provided.
 */
export function createLLMProvider(config?: Partial<LLMProviderConfig>): LLMProvider {
  const provider = config?.provider ?? (process.env.LLM_PROVIDER as 'claude' | 'mock') ?? 'claude';

  if (provider === 'mock') {
    return new MockLLMProvider();
  }

  const apiKey = config?.apiKey ?? process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY is required for ClaudeProvider. Set env var or pass apiKey in config.');
  }

  return new ClaudeProvider({
    apiKey,
    model: config?.model ?? process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6',
    maxRetries: config?.maxRetries ?? 3,
    timeoutMs: config?.timeoutMs ?? 60_000,
  });
}
