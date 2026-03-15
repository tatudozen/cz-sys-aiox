/**
 * Agent Base Class
 * Story 3.3 — AC-1: Abstract base for all CopyZen agents
 */

import type { LLMProvider, LLMResponse, LLMOptions } from '../llm/types.js';

export interface AgentConfig {
  llm: LLMProvider;
  agentApiKey?: string;
}

export abstract class Agent {
  protected readonly llm: LLMProvider;

  constructor(config: AgentConfig) {
    this.llm = config.llm;
  }

  protected async callLLM(
    systemPrompt: string,
    userPrompt: string,
    options?: Omit<LLMOptions, 'systemPrompt'>,
  ): Promise<LLMResponse> {
    return this.llm.complete(userPrompt, { ...options, systemPrompt });
  }
}
