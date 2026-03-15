/**
 * CMO Sales Strategy Prompt
 * Story 6.2 — Task 1
 *
 * Generates strategic context for the Copywriter when producing sales page copy.
 * Output: angle, USP, main objections, social proof angle.
 */

import type { BrandConfig } from '@copyzen/core';

export interface SalesStrategy {
  angle: string;
  usp: string;
  main_objections: string[];
  social_proof_angle: string;
  target_emotion: string;
}

export function buildSalesStrategyPrompt(brief: string, brandConfig: BrandConfig): string {
  const tone = brandConfig.tone_of_voice;
  const keywords = brandConfig.keywords.join(', ');

  return `Você é um CMO (Chief Marketing Officer) especialista em estratégia de vendas para o mercado brasileiro.

MISSÃO: Criar a estratégia estratégica para uma página de vendas de alta conversão.

BRIEFING DO CLIENTE:
${brief}

BRAND CONFIG:
- Tom de voz: ${tone}
- Palavras-chave: ${keywords}

Analise o briefing e defina a estratégia de vendas. Retorne SOMENTE JSON válido:
{
  "angle": "O ângulo principal de venda (ex: 'dor de perder dinheiro com marketing que não converte')",
  "usp": "Unique Selling Proposition — o que torna este profissional/produto único",
  "main_objections": ["Objeção 1 que o lead terá", "Objeção 2", "Objeção 3"],
  "social_proof_angle": "Que tipo de prova social será mais convincente para este nicho (ex: 'resultados financeiros', 'transformação de carreira', 'tempo economizado')",
  "target_emotion": "Emoção principal a ativar (ex: 'medo de perder oportunidade', 'desejo de reconhecimento', 'frustração com situação atual')"
}`;
}
