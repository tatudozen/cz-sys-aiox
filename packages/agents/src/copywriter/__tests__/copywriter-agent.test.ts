/**
 * Copywriter Agent Unit Tests — Story 3.4
 * AC-9: structure validation, brand compliance, revision
 */

import { describe, it, expect } from 'vitest';
import { CopywriterAgent } from '../copywriter-agent.js';
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
  keywords: ['inovação', 'qualidade', 'crescimento', 'resultados', 'digital'],
  reference_images: [],
};

const validPostJson = JSON.stringify({
  headline: 'Transforme seu negócio com inovação digital',
  body: 'Descubra como resultados reais de crescimento e qualidade podem mudar sua empresa.',
  cta: 'Saiba mais',
  hashtags: ['inovação', 'crescimento', 'digital'],
});

const validLandingJson = JSON.stringify({
  headline: 'Resultados reais de inovação digital',
  subheadline: 'Para quem quer crescimento com qualidade',
  body_sections: [{ title: 'Por que agora?', content: 'Porque inovação e resultados não esperam.' }],
  cta: 'Quero começar',
  cta_secondary: 'Saiba mais',
});

const validSalesJson = JSON.stringify({
  hero_headline: 'Inovação que gera resultados digitais reais',
  hero_subheadline: 'Crescimento com qualidade para o seu negócio',
  problem_section: 'Você ainda não tem a inovação necessária para crescimento.',
  solution_section: 'Nossa solução entrega resultados digitais com qualidade.',
  benefits: ['Mais inovação', 'Qualidade superior', 'Crescimento digital'],
  testimonial_placeholders: ['[Cliente A]', '[Cliente B]'],
  cta_primary: 'Começar agora',
  cta_secondary: 'Falar com especialista',
  urgency_element: 'Oferta por tempo limitado',
});

describe('CopywriterAgent.generatePostCopy', () => {
  it('returns PostCopy structure with required fields', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validPostJson]) });
    const result = await agent.generatePostCopy('Brief de teste', mockBrand, 'inception', 'image');

    expect(result).toHaveProperty('headline');
    expect(result).toHaveProperty('body');
    expect(result).toHaveProperty('cta');
    expect(result).toHaveProperty('hashtags');
    expect(result).toHaveProperty('metadata');
  });

  it('metadata includes correct mode and type', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validPostJson]) });
    const result = await agent.generatePostCopy('Brief', mockBrand, 'atracao_fatal', 'carousel');

    expect(result.metadata.mode).toBe('atracao_fatal');
    expect(result.metadata.type).toBe('carousel');
  });

  it('marks brand_compliant true for compliant copy', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validPostJson]) });
    const result = await agent.generatePostCopy('Brief', mockBrand, 'inception', 'image');

    expect(result.metadata.brand_compliant).toBe(true);
  });

  it('hashtags is array', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validPostJson]) });
    const result = await agent.generatePostCopy('Brief', mockBrand, 'inception', 'image');

    expect(Array.isArray(result.hashtags)).toBe(true);
  });

  it('falls back gracefully when LLM returns invalid JSON', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider(['Não consigo gerar isso agora.']) });
    const result = await agent.generatePostCopy('Brief', mockBrand, 'inception', 'image');

    expect(result.headline).toBeTruthy();
    expect(result.cta).toBeTruthy();
  });
});

describe('CopywriterAgent.generateLandingPageCopy', () => {
  it('returns LandingPageCopy with page_type', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validLandingJson]) });
    const result = await agent.generateLandingPageCopy('Brief', mockBrand, 'apresentacao');

    expect(result.page_type).toBe('apresentacao');
    expect(result.headline).toBeTruthy();
    expect(Array.isArray(result.body_sections)).toBe(true);
  });

  it('returns metadata with brand_compliant', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validLandingJson]) });
    const result = await agent.generateLandingPageCopy('Brief', mockBrand, 'retencao');

    expect(result.metadata).toHaveProperty('brand_compliant');
    expect(result.metadata.page_type).toBe('retencao');
  });
});

describe('CopywriterAgent.generateSalesPageCopy', () => {
  it('returns SalesPageCopy with all sections', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validSalesJson]) });
    const result = await agent.generateSalesPageCopy('Brief', mockBrand);

    expect(result.hero_headline).toBeTruthy();
    expect(Array.isArray(result.benefits)).toBe(true);
    expect(result.benefits.length).toBeGreaterThan(0);
    expect(result.cta_primary).toBeTruthy();
  });

  it('includes testimonial_placeholders', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validSalesJson]) });
    const result = await agent.generateSalesPageCopy('Brief', mockBrand);

    expect(Array.isArray(result.testimonial_placeholders)).toBe(true);
  });
});

describe('CopywriterAgent.revise', () => {
  it('returns revised copy string', async () => {
    const revisedText = 'Versão revisada com mais inovação e resultados para crescimento digital.';
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([revisedText]) });
    const result = await agent.revise('Copy original', 'Adicione mais keywords', mockBrand);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('produces different output from original', async () => {
    const original = 'Copy original sem keywords';
    const revised = 'Copy revisado com inovação e crescimento digital de qualidade.';
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([revised]) });
    const result = await agent.revise(original, 'Adicione keywords da marca', mockBrand);

    expect(result).not.toBe(original);
  });
});
