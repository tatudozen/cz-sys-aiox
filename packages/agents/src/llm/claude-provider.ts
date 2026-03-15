/**
 * Claude LLM Provider
 * Story 3.1 — AC-2: ClaudeProvider with retry (3x exponential backoff) + 60s timeout
 */

import type { LLMOptions, LLMProvider, LLMResponse } from './types.js';

const CLAUDE_COST_PER_MILLION = {
  'claude-sonnet-4-6': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4.0 },
  'claude-opus-4-6': { input: 15.0, output: 75.0 },
} as const;

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = CLAUDE_COST_PER_MILLION[model as keyof typeof CLAUDE_COST_PER_MILLION] ?? { input: 3.0, output: 15.0 };
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ClaudeProvider implements LLMProvider {
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;

  constructor(config: {
    apiKey: string;
    model?: string;
    maxRetries?: number;
    timeoutMs?: number;
  }) {
    this.apiKey = config.apiKey;
    this.defaultModel = config.model ?? 'claude-sonnet-4-6';
    this.maxRetries = config.maxRetries ?? 3;
    this.timeoutMs = config.timeoutMs ?? 60_000;
  }

  async complete(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    const model = options?.model ?? this.defaultModel;
    const maxTokens = options?.maxTokens ?? 1024;
    const temperature = options?.temperature ?? 0.7;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const startMs = Date.now();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const body = {
          model,
          max_tokens: maxTokens,
          temperature,
          ...(options?.systemPrompt ? { system: options.systemPrompt } : {}),
          messages: [{ role: 'user' as const, content: prompt }],
        };

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          // 429 or 5xx — retry with backoff
          if (response.status === 429 || response.status >= 500) {
            throw new Error(`Claude API error ${response.status}: ${errorText}`);
          }
          // 4xx client errors (except 429) — don't retry
          throw new Error(`Claude API client error ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as {
          content: Array<{ type: string; text: string }>;
          usage: { input_tokens: number; output_tokens: number };
          model: string;
        };

        const latencyMs = Date.now() - startMs;
        const inputTokens = data.usage.input_tokens;
        const outputTokens = data.usage.output_tokens;
        const content = data.content.find((c) => c.type === 'text')?.text ?? '';

        return {
          content,
          inputTokens,
          outputTokens,
          model: data.model,
          latencyMs,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Abort errors from timeout — don't retry
        if (lastError.name === 'AbortError') {
          throw new Error(`Claude API timeout after ${this.timeoutMs}ms`);
        }

        // Client errors (4xx except 429) — don't retry
        if (lastError.message.includes('client error 4')) {
          throw lastError;
        }

        if (attempt < this.maxRetries - 1) {
          const backoffMs = Math.pow(2, attempt) * 1_000; // 1s, 2s, 4s
          await sleep(backoffMs);
        }
      }
    }

    throw new Error(`Claude API failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }
}
