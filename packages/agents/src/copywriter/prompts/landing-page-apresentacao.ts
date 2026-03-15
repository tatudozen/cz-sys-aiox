/**
 * Landing Page — Apresentação (A) Prompt Builder
 * Story 5.2 — AC-2
 *
 * Specialized prompt for FunWheel Stage A pages.
 * Generates a transformation narrative with 4 structured sections:
 * Hero → Problem → Journey → Solution → CTA
 */

import type { BrandConfig } from '@copyzen/core';

/**
 * Builds the user prompt for generating Apresentação copy.
 * The LLM returns structured JSON matching ApresentacaoCopy.
 */
export function buildApresentacaoPrompt(brief: string, brandConfig: BrandConfig): string {
  const tone = brandConfig.tone_of_voice ?? 'casual';
  const keywords = brandConfig.keywords ?? [];
  const keywordHint =
    keywords.length > 0 ? `\nPalavras-chave da marca: ${keywords.slice(0, 5).join(', ')}` : '';

  return `Crie copy para uma Página de Apresentação (Stage A do FunWheel — Atração, Retenção, Transformação).

OBJETIVO: Engajar o visitante com uma narrativa de transformação, despertar curiosidade e direcionar para a próxima etapa.
TOM: ${tone}${keywordHint}

BRIEFING DO CLIENTE:
${brief}

ESTRUTURA OBRIGATÓRIA — Retorne JSON exato:
{
  "hero": {
    "headline": "Headline poderosa e impactante (máx. 10 palavras)",
    "subheadline": "Complementa o headline, aprofunda a transformação (1-2 frases)"
  },
  "problem": {
    "text": "Descrição do problema/dor do público-alvo (2-3 frases empáticas)",
    "pain_points": [
      "Dor específica 1",
      "Dor específica 2",
      "Dor específica 3"
    ]
  },
  "journey": [
    { "step": 1, "title": "Título da etapa 1", "description": "Descrição concisa da etapa 1" },
    { "step": 2, "title": "Título da etapa 2", "description": "Descrição concisa da etapa 2" },
    { "step": 3, "title": "Título da etapa 3", "description": "Descrição concisa da etapa 3" },
    { "step": 4, "title": "Título da etapa 4 (transformação final)", "description": "Resultado concreto" }
  ],
  "solution": {
    "text": "Como o profissional/produto resolve o problema (2-3 frases diretas e persuasivas)",
    "value_props": [
      "Proposta de valor 1",
      "Proposta de valor 2",
      "Proposta de valor 3"
    ]
  },
  "cta": {
    "text": "CTA persuasivo e orientado à ação (máx. 6 palavras)"
  }
}`;
}
