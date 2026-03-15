/**
 * BrandGuardrails
 * Story 3.2 — AC-3, AC-4: System prompt additions, style constraints, compliance validation.
 */

import type { BrandConfig } from './brand-config.js';

export interface ValidationResult {
  compliant: boolean;
  issues: string[];
}

export interface BrandTheme {
  cssVars: Record<string, string>;
  tailwindConfig: {
    colors: Record<string, string>;
    fontFamily: Record<string, string[]>;
  };
}

/**
 * Generate system prompt additions for LLM agents based on brand config.
 * Story 3.2 — AC-3
 */
export function buildBrandGuardrails(config: BrandConfig): {
  systemPromptAddition: string;
  styleConstraints: string;
  validationChecklist: string[];
} {
  const keywordsList = config.keywords.slice(0, 10).join(', ') || 'nenhuma palavra-chave definida';
  const guidelinesSection = config.custom_guidelines
    ? `\nDiretrizes personalizadas:\n${config.custom_guidelines}`
    : '';

  const systemPromptAddition = `
IDENTIDADE DE MARCA:
- Tom de voz: ${config.tone_of_voice === 'formal' ? 'formal e profissional' : config.tone_of_voice === 'casual' ? 'casual e conversacional' : 'técnico e especializado'}
- Palavras-chave obrigatórias: ${keywordsList}
- Slogan: ${config.slogan || 'não definido'}${guidelinesSection}

REGRAS DE LINGUAGEM:
- Sempre use o tom de voz "${config.tone_of_voice}" em todos os textos
- Incorpore naturalmente as palavras-chave listadas
- Evite termos que contradizem a identidade da marca
`.trim();

  const styleConstraints = `
PALETA DE CORES:
- Primária: ${config.primary_color}
- Secundária: ${config.secondary_color}
- Destaque: ${config.accent_color}
- Fundo: ${config.background_color}
- Texto: ${config.text_color}

TIPOGRAFIA:
- Títulos: ${config.heading_font}
- Corpo: ${config.body_font}
`.trim();

  const validationChecklist = [
    `Tom de voz "${config.tone_of_voice}" mantido`,
    `Pelo menos 3 palavras-chave utilizadas: ${keywordsList}`,
    'Sem termos contraditórios à marca',
    'Linguagem em português brasileiro',
    'CTA claro e alinhado ao tom',
  ];

  return { systemPromptAddition, styleConstraints, validationChecklist };
}

/**
 * Validate if a generated output complies with brand guidelines.
 * Story 3.2 — AC-4
 */
export function validateBrandCompliance(output: string, config: BrandConfig): ValidationResult {
  const issues: string[] = [];
  const lowerOutput = output.toLowerCase();

  // Check keyword presence (at least 1 of top 5)
  const topKeywords = config.keywords.slice(0, 5);
  if (topKeywords.length > 0) {
    const hasKeyword = topKeywords.some((kw) => lowerOutput.includes(kw.toLowerCase()));
    if (!hasKeyword) {
      issues.push(`Nenhuma das palavras-chave principais encontrada: ${topKeywords.join(', ')}`);
    }
  }

  // Tone heuristics
  if (config.tone_of_voice === 'formal') {
    const informalMarkers = ['oi', 'opa', 'valeu', 'show', 'legal!'];
    const informalFound = informalMarkers.filter((m) => lowerOutput.includes(m));
    if (informalFound.length > 2) {
      issues.push(`Tom formal violado — termos informais detectados: ${informalFound.join(', ')}`);
    }
  }

  if (config.tone_of_voice === 'technical') {
    const wordCount = output.split(/\s+/).length;
    if (wordCount < 50) {
      issues.push('Tom técnico requer mais profundidade — texto muito curto');
    }
  }

  return {
    compliant: issues.length === 0,
    issues,
  };
}

/**
 * Generate CSS custom properties and Tailwind config from BrandConfig.
 * Story 3.2 — Used by DesignerAgent (Story 3.5)
 */
export function buildBrandTheme(config: BrandConfig): BrandTheme {
  return {
    cssVars: {
      '--brand-primary': config.primary_color,
      '--brand-secondary': config.secondary_color,
      '--brand-accent': config.accent_color,
      '--brand-bg': config.background_color,
      '--brand-text': config.text_color,
    },
    tailwindConfig: {
      colors: {
        'brand-primary': config.primary_color,
        'brand-secondary': config.secondary_color,
        'brand-accent': config.accent_color,
        'brand-bg': config.background_color,
        'brand-text': config.text_color,
      },
      fontFamily: {
        heading: [config.heading_font, 'sans-serif'],
        body: [config.body_font, 'sans-serif'],
      },
    },
  };
}
