/**
 * Carousel Subsystem Tests — Story 4.2
 * AC-6: 5-slide carousel in each mode → structure validation → brand compliance
 */

import { describe, it, expect } from 'vitest';
import { CopywriterAgent } from '../copywriter-agent.js';
import { DesignerAgent } from '../../designer/designer-agent.js';
import { MockLLMProvider } from '../../llm/factory.js';
import type { BrandConfig } from '@copyzen/core';

const mockBrand: BrandConfig = {
  id: 'brand-1',
  client_id: 'client-1',
  primary_color: '#0F172A',
  secondary_color: '#6366F1',
  accent_color: '#F59E0B',
  background_color: '#F8FAFC',
  text_color: '#1E293B',
  heading_font: 'Inter',
  body_font: 'Inter',
  tone_of_voice: 'technical',
  custom_guidelines: null,
  logo_url: null,
  slogan: 'Marketing inteligente com IA',
  keywords: ['marketing', 'inteligência artificial', 'automação', 'copy', 'vendas'],
  reference_images: [],
};

const validCarouselJson = JSON.stringify([
  { index: 0, copy_text: 'Como a automação transforma vendas', layout_hint: 'cover' },
  { index: 1, copy_text: 'Ponto 1: marketing com inteligência artificial', layout_hint: 'content' },
  { index: 2, copy_text: 'Ponto 2: copy automatizado para leads', layout_hint: 'content' },
  { index: 3, copy_text: 'Ponto 3: resultados de automação em vendas', layout_hint: 'content' },
  { index: 4, copy_text: 'Salva esse post sobre automação e marketing!', layout_hint: 'cta' },
]);

describe('CopywriterAgent.generateCarouselCopy — inception mode', () => {
  it('returns array of 5 slides', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validCarouselJson]) });
    const slides = await agent.generateCarouselCopy('Marketing com IA', mockBrand, 'inception', 5);

    expect(Array.isArray(slides)).toBe(true);
    expect(slides.length).toBe(5);
  });

  it('first slide has layout_hint cover', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validCarouselJson]) });
    const slides = await agent.generateCarouselCopy('Marketing com IA', mockBrand, 'inception', 5);

    expect(slides[0].layout_hint).toBe('cover');
  });

  it('last slide has layout_hint cta', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validCarouselJson]) });
    const slides = await agent.generateCarouselCopy('Marketing com IA', mockBrand, 'inception', 5);

    expect(slides[slides.length - 1].layout_hint).toBe('cta');
  });

  it('all slides have required fields', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validCarouselJson]) });
    const slides = await agent.generateCarouselCopy('Marketing com IA', mockBrand, 'inception', 5);

    for (const slide of slides) {
      expect(slide).toHaveProperty('index');
      expect(slide).toHaveProperty('copy_text');
      expect(slide).toHaveProperty('image_prompt');
      expect(slide).toHaveProperty('image_url');
      expect(slide).toHaveProperty('layout_hint');
    }
  });

  it('image_url is null (filled by Designer)', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validCarouselJson]) });
    const slides = await agent.generateCarouselCopy('Brief', mockBrand, 'inception', 5);

    expect(slides.every((s) => s.image_url === null)).toBe(true);
  });
});

describe('CopywriterAgent.generateCarouselCopy — atracao_fatal mode', () => {
  const afJson = JSON.stringify([
    { index: 0, copy_text: 'Você está perdendo vendas agora mesmo', layout_hint: 'cover' },
    { index: 1, copy_text: 'A realidade sobre automação e vendas', layout_hint: 'content' },
    { index: 2, copy_text: 'Como marketing com copy muda seus resultados', layout_hint: 'content' },
    { index: 3, copy_text: 'Quem usa inteligência artificial fatura mais', layout_hint: 'content' },
    { index: 4, copy_text: 'Acesse agora — link na bio!', layout_hint: 'cta' },
  ]);

  it('generates 5 slides for atracao_fatal', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([afJson]) });
    const slides = await agent.generateCarouselCopy('Conversão', mockBrand, 'atracao_fatal', 5);

    expect(slides.length).toBe(5);
    expect(slides[0].layout_hint).toBe('cover');
    expect(slides[4].layout_hint).toBe('cta');
  });
});

describe('CopywriterAgent.generateCarouselCopy — fallback', () => {
  it('returns fallback structure when LLM returns invalid JSON', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider(['Não consigo gerar carrossel.']) });
    const slides = await agent.generateCarouselCopy('Brief', mockBrand, 'inception', 5);

    expect(slides.length).toBe(5);
    expect(slides[0].layout_hint).toBe('cover');
    expect(slides[4].layout_hint).toBe('cta');
  });
});

describe('DesignerAgent.generateCarouselVisuals', () => {
  it('fills image_prompt for each slide', async () => {
    const copyAgent = new CopywriterAgent({ llm: new MockLLMProvider([validCarouselJson]) });
    const slides = await copyAgent.generateCarouselCopy('Brief', mockBrand, 'inception', 5);

    const designAgent = new DesignerAgent({
      llm: new MockLLMProvider(Array(5).fill('Brand-consistent carousel slide visual')),
    });
    const result = await designAgent.generateCarouselVisuals(slides, mockBrand);

    expect(result.length).toBe(5);
    expect(result.every((s) => s.image_prompt.length > 0)).toBe(true);
  });

  it('preserves slide copy and layout_hint', async () => {
    const copyAgent = new CopywriterAgent({ llm: new MockLLMProvider([validCarouselJson]) });
    const slides = await copyAgent.generateCarouselCopy('Brief', mockBrand, 'inception', 5);

    const designAgent = new DesignerAgent({
      llm: new MockLLMProvider(Array(5).fill('Visual prompt for slide')),
    });
    const result = await designAgent.generateCarouselVisuals(slides, mockBrand);

    expect(result[0].layout_hint).toBe('cover');
    expect(result[0].copy_text).toBeTruthy();
  });
});
