/**
 * LLM Abstraction Layer — Types
 * Story 3.1 — AC-1: Core interfaces for LLM provider abstraction
 */

export interface LLMOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface LLMResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  latencyMs: number;
}

/**
 * Core LLM provider interface — extensible for future providers (NFR-10).
 * Current implementation: ClaudeProvider.
 * Future: OpenAIProvider, MockProvider (tests)
 */
export interface LLMProvider {
  complete(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
}

export interface LLMProviderConfig {
  provider: 'claude' | 'mock';
  apiKey?: string;
  model?: string;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface LLMUsageLog {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalCostUsd: number;
  latencyMs: number;
  timestamp: string;
}
