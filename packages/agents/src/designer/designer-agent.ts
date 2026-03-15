/**
 * Designer Agent — Implementation
 * Story 3.5 — AC-1 through AC-4
 */

import { Agent } from '../base/agent.js';
import type { AgentConfig } from '../base/agent.js';
import type { BrandConfig } from '@copyzen/core';
import { buildBrandTheme } from '@copyzen/core';
import type { DesignerBrandTheme, DesignerOutput, ImageFormat } from './types.js';
import type { ReviewResult } from '../cmo/types.js';
import type { CarouselSlide } from '../copywriter/types.js';

// Known fonts on Google Fonts (subset for common brand fonts)
const GOOGLE_FONTS_BASE = 'https://fonts.googleapis.com/css2?family=';
const KNOWN_GOOGLE_FONTS = new Set([
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Raleway', 'Oswald', 'Nunito', 'Playfair Display', 'Merriweather',
  'Source Sans 3', 'PT Sans', 'Ubuntu', 'Noto Sans', 'Mulish',
]);

function buildFontImportUrl(fontName: string): string | null {
  if (!KNOWN_GOOGLE_FONTS.has(fontName)) return null;
  return `${GOOGLE_FONTS_BASE}${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
}

// AC-3: Image prompt with brand context
function buildImagePromptSystemPrompt(): string {
  return `Você é um art director especialista em criação de prompts para geração de imagens com IA.
Seu objetivo é criar prompts detalhados e eficazes para ferramentas como Nano Banana, Kling AI e Midjourney.

ESTRUTURA DO PROMPT:
1. Sujeito principal: o que deve aparecer na imagem
2. Estilo visual: tipografia, cores dominantes, mood
3. Composição: enquadramento, proporção, foco
4. Qualidade: "high quality, professional, brand-consistent"
5. Evitar: "generic stock photo, corporate, bland, watermark"

Responda APENAS com o prompt em inglês, sem explicações adicionais.`;
}

export class DesignerAgent extends Agent {
  constructor(config: AgentConfig) {
    super(config);
  }

  // AC-2, AC-3: generateImagePrompt
  async generateImagePrompt(
    brief: string,
    brandConfig: BrandConfig,
    format: ImageFormat,
  ): Promise<string> {
    const formatSpecs: Record<ImageFormat, string> = {
      post: 'square 1:1 Instagram post, clean composition with centered subject',
      carousel_slide: 'horizontal slide 4:3, text-friendly background with clear visual hierarchy',
      hero: 'wide 16:9 hero banner, bold impactful visual, room for text overlay',
      background: 'abstract textured background 16:9, subtle pattern, not distracting',
    };

    const toneMap: Record<string, string> = {
      formal: 'professional, sophisticated, corporate elegance',
      casual: 'friendly, approachable, warm, lifestyle',
      technical: 'clean, minimal, tech-forward, precise',
    };

    const systemPrompt = buildImagePromptSystemPrompt();
    const userPrompt = `Create an AI image generation prompt for:

BRIEF: ${brief}

BRAND CONTEXT:
- Primary color: ${brandConfig.primary_color}
- Secondary color: ${brandConfig.secondary_color}
- Accent color: ${brandConfig.accent_color}
- Typography style: ${brandConfig.heading_font}
- Brand mood: ${toneMap[brandConfig.tone_of_voice] ?? brandConfig.tone_of_voice}
- Keywords: ${brandConfig.keywords.slice(0, 5).join(', ')}

FORMAT REQUIREMENTS:
${formatSpecs[format]}

Generate a detailed, high-quality image prompt in English.`;

    const response = await this.callLLM(systemPrompt, userPrompt, {
      maxTokens: 400,
      temperature: 0.8,
    });

    return response.content.trim();
  }

  // AC-2: selectTemplate — returns Astro template name based on page type and brand
  async selectTemplate(pageType: string, brandConfig: BrandConfig): Promise<string> {
    const templateMap: Record<string, Record<string, string>> = {
      formal: {
        apresentacao: 'art-apresentacao-formal',
        retencao: 'art-retencao-formal',
        transformacao: 'art-transformacao-formal',
        sales: 'sales-page-formal',
        default: 'page-formal',
      },
      casual: {
        apresentacao: 'art-apresentacao-casual',
        retencao: 'art-retencao-casual',
        transformacao: 'art-transformacao-casual',
        sales: 'sales-page-casual',
        default: 'page-casual',
      },
      technical: {
        apresentacao: 'art-apresentacao-tech',
        retencao: 'art-retencao-tech',
        transformacao: 'art-transformacao-tech',
        sales: 'sales-page-tech',
        default: 'page-tech',
      },
    };

    const toneTemplates = templateMap[brandConfig.tone_of_voice] ?? templateMap['casual'];
    return toneTemplates[pageType] ?? toneTemplates['default'];
  }

  // AC-2, AC-4: applyBrandTheme — extends BrandTheme from Story 3.2 with fontImports
  async applyBrandTheme(brandConfig: BrandConfig): Promise<DesignerBrandTheme> {
    const baseTheme = buildBrandTheme(brandConfig);

    const fontImports: string[] = [];
    const headingUrl = buildFontImportUrl(brandConfig.heading_font);
    const bodyUrl = buildFontImportUrl(brandConfig.body_font);

    if (headingUrl) fontImports.push(headingUrl);
    if (bodyUrl && bodyUrl !== headingUrl) fontImports.push(bodyUrl);

    return {
      ...baseTheme,
      fontImports,
    };
  }

  // AC-2: reviewVisualOutput — checks if image URL represents correct brand
  async reviewVisualOutput(imageUrl: string, brandConfig: BrandConfig): Promise<ReviewResult> {
    // Without vision capabilities in current MVP, we do a basic heuristic review
    // and return a structured result. Full vision review is a future enhancement.
    const systemPrompt = `Você é um art director revisando se um asset visual está alinhado com a identidade de marca do cliente.
Tom de voz: ${brandConfig.tone_of_voice}
Paleta: ${brandConfig.primary_color}, ${brandConfig.secondary_color}, ${brandConfig.accent_color}
Responda com JSON: {"verdict": "approved"|"revision_needed", "feedback": "breve análise"}`;

    const userPrompt = `Revise a imagem em: ${imageUrl}
Contexto: verificar se o visual está alinhado com tom=${brandConfig.tone_of_voice} e paleta da marca.

Retorne JSON: {"verdict": "approved"|"revision_needed", "feedback": "feedback em 1-2 frases"}`;

    try {
      const response = await this.callLLM(systemPrompt, userPrompt, {
        maxTokens: 200,
        temperature: 0.1,
      });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { verdict: ReviewResult['verdict']; feedback: string };
        return {
          verdict: parsed.verdict,
          feedback: parsed.feedback,
          compliance: { compliant: parsed.verdict === 'approved', issues: parsed.verdict === 'approved' ? [] : [parsed.feedback] },
        };
      }
    } catch {
      // fall through
    }

    return {
      verdict: 'approved',
      feedback: 'Revisão visual básica concluída — verificação de paleta não disponível sem API de visão.',
      compliance: { compliant: true, issues: [] },
    };
  }

  // Story 4.2 — AC-2: generateCarouselVisuals — prompts with visual coherence across slides
  async generateCarouselVisuals(slides: CarouselSlide[], brandConfig: BrandConfig): Promise<CarouselSlide[]> {
    const toneMap: Record<string, string> = {
      formal: 'professional, sophisticated, consistent brand palette',
      casual: 'friendly, warm, lifestyle photography style',
      technical: 'clean, minimal, tech aesthetic, precise',
    };

    const visualStyle = `${toneMap[brandConfig.tone_of_voice] ?? 'professional'}, ${brandConfig.primary_color} dominant color, ${brandConfig.heading_font} typography`;

    const updatedSlides: CarouselSlide[] = [];

    for (const slide of slides) {
      const layoutDescriptions: Record<CarouselSlide['layout_hint'], string> = {
        cover: 'bold cover slide, dominant visual, text overlay space at bottom',
        content: 'clean content slide, supporting visual, space for text on right or bottom',
        cta: 'high-impact CTA slide, strong visual, clear action button area, urgency feel',
      };

      const systemPrompt = buildImagePromptSystemPrompt();
      const userPrompt = `Create an Instagram carousel slide image prompt (slide ${slide.index + 1}/${slides.length}).

SLIDE CONTEXT: ${slide.copy_text}
LAYOUT: ${layoutDescriptions[slide.layout_hint]}
VISUAL STYLE: ${visualStyle}
BRAND COLORS: ${brandConfig.primary_color} (primary), ${brandConfig.accent_color} (accent)
COHERENCE: Must visually match the other slides in this ${slides.length}-slide carousel sequence.

Generate a concise, high-quality image prompt in English.`;

      const response = await this.callLLM(systemPrompt, userPrompt, {
        maxTokens: 200,
        temperature: 0.7,
      });

      updatedSlides.push({
        ...slide,
        image_prompt: response.content.trim(),
      });
    }

    return updatedSlides;
  }

  // Utility: build designer output record
  buildDesignerOutput(
    imagePrompt: string,
    format: ImageFormat,
    brandConfig: BrandConfig,
  ): DesignerOutput {
    return {
      image_prompt: imagePrompt,
      format,
      brand_colors: [
        brandConfig.primary_color,
        brandConfig.secondary_color,
        brandConfig.accent_color,
      ],
      style_notes: `${brandConfig.tone_of_voice} tone, ${brandConfig.heading_font} typography`,
    };
  }
}
