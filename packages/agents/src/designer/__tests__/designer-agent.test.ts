/**
 * Designer Agent Unit Tests — Story 3.5
 * AC-7: image prompt includes brand colors, applyBrandTheme generates CSS vars
 */

import { describe, it, expect } from 'vitest';
import { DesignerAgent } from '../designer-agent.js';
import { MockLLMProvider } from '../../llm/factory.js';
import type { BrandConfig } from '@copyzen/core';

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
  keywords: ['inovação', 'qualidade', 'crescimento'],
  reference_images: [],
};

describe('DesignerAgent.generateImagePrompt', () => {
  it('returns a non-empty string prompt', async () => {
    const mockPrompt = 'A vibrant square post with orange #FF5500 dominant color, Inter typography, friendly lifestyle mood, clean composition with centered subject, high quality professional brand-consistent';
    const agent = new DesignerAgent({ llm: new MockLLMProvider([mockPrompt]) });
    const result = await agent.generateImagePrompt('Produto de marketing digital', mockBrand, 'post');

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(10);
  });

  it('returns trimmed string without extra whitespace', async () => {
    const agent = new DesignerAgent({ llm: new MockLLMProvider(['  brand prompt  ']) });
    const result = await agent.generateImagePrompt('Brief', mockBrand, 'carousel_slide');

    expect(result).toBe('brand prompt');
  });
});

describe('DesignerAgent.applyBrandTheme', () => {
  it('generates CSS custom properties', async () => {
    const agent = new DesignerAgent({ llm: new MockLLMProvider() });
    const theme = await agent.applyBrandTheme(mockBrand);

    expect(theme.cssVars['--brand-primary']).toBe('#FF5500');
    expect(theme.cssVars['--brand-secondary']).toBe('#0055FF');
    expect(theme.cssVars['--brand-accent']).toBe('#FFD700');
    expect(theme.cssVars['--brand-text']).toBe('#1A1A1A');
  });

  it('generates tailwind color config', async () => {
    const agent = new DesignerAgent({ llm: new MockLLMProvider() });
    const theme = await agent.applyBrandTheme(mockBrand);

    expect(theme.tailwindConfig.colors['brand-primary']).toBe('#FF5500');
  });

  it('generates font family config', async () => {
    const agent = new DesignerAgent({ llm: new MockLLMProvider() });
    const theme = await agent.applyBrandTheme(mockBrand);

    expect(theme.tailwindConfig.fontFamily.heading[0]).toBe('Inter');
  });

  it('includes Google Fonts import URL for Inter', async () => {
    const agent = new DesignerAgent({ llm: new MockLLMProvider() });
    const theme = await agent.applyBrandTheme(mockBrand);

    expect(theme.fontImports.length).toBeGreaterThan(0);
    expect(theme.fontImports[0]).toContain('fonts.googleapis.com');
    expect(theme.fontImports[0]).toContain('Inter');
  });

  it('deduplicates font imports for same heading/body font', async () => {
    const agent = new DesignerAgent({ llm: new MockLLMProvider() });
    const theme = await agent.applyBrandTheme({ ...mockBrand, heading_font: 'Inter', body_font: 'Inter' });

    // Should only include Inter once
    expect(theme.fontImports.length).toBe(1);
  });
});

describe('DesignerAgent.selectTemplate', () => {
  it('returns template name for casual tone', async () => {
    const agent = new DesignerAgent({ llm: new MockLLMProvider() });
    const template = await agent.selectTemplate('apresentacao', mockBrand);

    expect(template).toBe('art-apresentacao-casual');
  });

  it('returns technical template for technical tone', async () => {
    const agent = new DesignerAgent({ llm: new MockLLMProvider() });
    const template = await agent.selectTemplate('sales', { ...mockBrand, tone_of_voice: 'technical' });

    expect(template).toBe('sales-page-tech');
  });

  it('returns default template for unknown page type', async () => {
    const agent = new DesignerAgent({ llm: new MockLLMProvider() });
    const template = await agent.selectTemplate('unknown-page', mockBrand);

    expect(template).toContain('page-');
  });
});

describe('DesignerAgent.buildDesignerOutput', () => {
  it('includes brand colors in output', () => {
    const agent = new DesignerAgent({ llm: new MockLLMProvider() });
    const output = agent.buildDesignerOutput('test prompt', 'post', mockBrand);

    expect(output.brand_colors).toContain('#FF5500');
    expect(output.brand_colors).toContain('#0055FF');
    expect(output.image_prompt).toBe('test prompt');
    expect(output.format).toBe('post');
  });
});
