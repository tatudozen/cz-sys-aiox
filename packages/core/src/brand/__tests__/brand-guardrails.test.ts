/**
 * Brand Guardrails Unit Tests — Story 3.2
 */

import { describe, it, expect } from 'vitest';
import { buildBrandGuardrails, validateBrandCompliance, buildBrandTheme } from '../brand-guardrails.js';
import type { BrandConfig } from '../brand-config.js';

const mockBrand: BrandConfig = {
  id: 'brand-1',
  client_id: 'client-1',
  primary_color: '#FF5500',
  secondary_color: '#0055FF',
  accent_color: '#FFD700',
  background_color: '#FFFFFF',
  text_color: '#1A1A1A',
  heading_font: 'Inter',
  body_font: 'Inter',
  tone_of_voice: 'casual',
  custom_guidelines: null,
  logo_url: null,
  slogan: 'Sua marca no próximo nível',
  keywords: ['inovação', 'qualidade', 'crescimento', 'resultados', 'digital'],
  reference_images: [],
};

describe('buildBrandGuardrails', () => {
  it('includes tone of voice in system prompt', () => {
    const { systemPromptAddition } = buildBrandGuardrails(mockBrand);
    expect(systemPromptAddition).toContain('casual');
  });

  it('includes keywords in system prompt', () => {
    const { systemPromptAddition } = buildBrandGuardrails(mockBrand);
    expect(systemPromptAddition).toContain('inovação');
  });

  it('includes slogan when defined', () => {
    const { systemPromptAddition } = buildBrandGuardrails(mockBrand);
    expect(systemPromptAddition).toContain('Sua marca no próximo nível');
  });

  it('includes color palette in style constraints', () => {
    const { styleConstraints } = buildBrandGuardrails(mockBrand);
    expect(styleConstraints).toContain('#FF5500');
    expect(styleConstraints).toContain('Inter');
  });

  it('returns non-empty validation checklist', () => {
    const { validationChecklist } = buildBrandGuardrails(mockBrand);
    expect(validationChecklist.length).toBeGreaterThan(0);
    expect(validationChecklist[0]).toContain('casual');
  });
});

describe('validateBrandCompliance', () => {
  it('returns compliant when keywords present', () => {
    const output = 'Este produto representa inovação e crescimento para o seu negócio digital.';
    const result = validateBrandCompliance(output, mockBrand);
    expect(result.compliant).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('reports missing keywords', () => {
    const output = 'Compre agora e ganhe desconto especial!';
    const result = validateBrandCompliance(output, mockBrand);
    expect(result.compliant).toBe(false);
    expect(result.issues[0]).toContain('palavras-chave');
  });

  it('compliant when no keywords configured', () => {
    const noKeywordsBrand = { ...mockBrand, keywords: [] };
    const result = validateBrandCompliance('qualquer texto', noKeywordsBrand);
    expect(result.compliant).toBe(true);
  });

  it('detects informal tone violations for formal brands', () => {
    const formalBrand = { ...mockBrand, tone_of_voice: 'formal' as const };
    const informalOutput = 'Oi, valeu! opa show legal! inovação legal show opa valeu';
    const result = validateBrandCompliance(informalOutput, formalBrand);
    expect(result.issues.some((i) => i.includes('formal'))).toBe(true);
  });
});

describe('buildBrandTheme', () => {
  it('generates CSS custom properties', () => {
    const theme = buildBrandTheme(mockBrand);
    expect(theme.cssVars['--brand-primary']).toBe('#FF5500');
    expect(theme.cssVars['--brand-text']).toBe('#1A1A1A');
  });

  it('generates Tailwind font families', () => {
    const theme = buildBrandTheme(mockBrand);
    expect(theme.tailwindConfig.fontFamily.heading[0]).toBe('Inter');
    expect(theme.tailwindConfig.fontFamily.body[0]).toBe('Inter');
  });

  it('generates Tailwind color palette', () => {
    const theme = buildBrandTheme(mockBrand);
    expect(theme.tailwindConfig.colors['brand-primary']).toBe('#FF5500');
    expect(theme.tailwindConfig.colors['brand-accent']).toBe('#FFD700');
  });
});
