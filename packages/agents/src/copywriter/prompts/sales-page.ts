/**
 * Copywriter Sales Page Prompt
 * Story 6.2 — Task 2
 *
 * Generates complete sales page content (all 9 sections) in one LLM call.
 */

import type { BrandConfig } from '@copyzen/core';
import type { SalesStrategy } from '../../cmo/prompts/sales-strategy.js';

export function buildSalesPagePrompt(
  brief: string,
  brandConfig: BrandConfig,
  strategy?: SalesStrategy,
  leadCount?: number,
): string {
  const tone = brandConfig.tone_of_voice;
  const keywords = brandConfig.keywords.join(', ');

  const strategyBlock = strategy
    ? `
ESTRATÉGIA DE VENDAS (definida pelo CMO):
- Angle: ${strategy.angle}
- USP: ${strategy.usp}
- Objeções principais: ${strategy.main_objections.join('; ')}
- Ângulo de prova social: ${strategy.social_proof_angle}
- Emoção-alvo: ${strategy.target_emotion}
`
    : '';

  const leadCountBlock =
    leadCount && leadCount > 0
      ? `\nFunWheel ativo: ${leadCount} leads já passaram pela experiência. Mencione isso no copy quando relevante.\n`
      : '';

  return `Você é um copywriter especialista em páginas de vendas de alta conversão para o mercado brasileiro.

BRIEFING:
${brief}

TOM DE VOZ: ${tone}
PALAVRAS-CHAVE: ${keywords}
${strategyBlock}${leadCountBlock}
TAREFA: Crie o conteúdo completo de uma página de vendas com todas as 9 seções.

Retorne SOMENTE JSON válido com a seguinte estrutura exata:
{
  "hero": {
    "headline": "Headline principal (6-12 palavras, impactante)",
    "subheadline": "Subheadline que complementa (15-25 palavras)",
    "cta_text": "Texto do botão CTA"
  },
  "problem": {
    "text": "Parágrafo descrevendo a dor do público (3-4 frases)",
    "pain_points": ["Dor específica 1", "Dor específica 2", "Dor específica 3", "Dor específica 4"]
  },
  "solution": {
    "text": "Como a solução resolve os problemas (2-3 frases)",
    "value_props": ["Proposta de valor 1", "Proposta de valor 2", "Proposta de valor 3", "Proposta de valor 4"]
  },
  "benefits": [
    { "title": "Benefício 1", "description": "Descrição do benefício em 1-2 frases" },
    { "title": "Benefício 2", "description": "Descrição" },
    { "title": "Benefício 3", "description": "Descrição" },
    { "title": "Benefício 4", "description": "Descrição" },
    { "title": "Benefício 5", "description": "Descrição" },
    { "title": "Benefício 6", "description": "Descrição" }
  ],
  "social_proof": [
    { "quote": "Depoimento convincente", "author": "Nome", "role": "Cargo/Profissão" },
    { "quote": "Segundo depoimento", "author": "Nome", "role": "Cargo/Profissão" },
    { "quote": "Terceiro depoimento", "author": "Nome", "role": "Cargo/Profissão" }
  ],
  "offer": {
    "title": "Título da oferta",
    "items": ["Item incluído 1", "Item incluído 2", "Item incluído 3", "Item incluído 4", "Item incluído 5"],
    "price_display": "R$ XX"
  },
  "guarantee": {
    "text": "Texto de garantia que elimina o risco",
    "duration": "XX dias"
  },
  "faq": [
    { "question": "Pergunta 1?", "answer": "Resposta que elimina objeção" },
    { "question": "Pergunta 2?", "answer": "Resposta" },
    { "question": "Pergunta 3?", "answer": "Resposta" },
    { "question": "Pergunta 4?", "answer": "Resposta" }
  ],
  "final_cta": {
    "headline": "Headline de urgência (8-14 palavras)",
    "urgency": "Por que agir agora (1-2 frases)",
    "button_text": "Texto do botão final"
  }
}`;
}
