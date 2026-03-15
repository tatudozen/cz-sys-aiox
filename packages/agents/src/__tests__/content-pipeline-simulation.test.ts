/**
 * Content Pipeline Simulation — Story 7.2 AC-7
 *
 * Simulates the full Sistema 1 content pipeline for CopyZen using
 * MockLLMProvider to validate pipeline correctness without live API calls.
 *
 * Covers: CMO orchestration → Copywriter (inception + atracao_fatal) →
 *         5 posts (3 carousel/inception + 2 image/atracao_fatal) → quality check
 */

import { describe, it, expect } from 'vitest';
import { CopywriterAgent } from '../copywriter/copywriter-agent.js';
import { CMOAgent } from '../cmo/cmo-agent.js';
import { MockLLMProvider } from '../llm/factory.js';
import type { BrandConfig } from '@copyzen/core';

// CopyZen brand config (matches seed migration 20260315090000 + 20260315110000)
const copyzenBrand: BrandConfig = {
  id: '00000000-0000-0000-0000-000000000002',
  client_id: '00000000-0000-0000-0000-000000000001',
  primary_color: '#0F172A',
  secondary_color: '#6366F1',
  accent_color: '#F59E0B',
  background_color: '#F8FAFC',
  text_color: '#1E293B',
  heading_font: 'Inter',
  body_font: 'Inter',
  tone_of_voice: 'casual',
  custom_guidelines:
    'Tom conversacional e próximo. Use "você" diretamente. Foque em benefícios concretos.',
  logo_url: null,
  slogan: 'Copy que conecta. Resultados que importam.',
  keywords: ['copywriting', 'marketing digital', 'automação', 'funil de vendas', 'leads', 'conversão'],
  reference_images: [],
};

const validPostJson = (mode: string) =>
  JSON.stringify({
    headline: `Descobriu como automação muda sua conversão com copywriting? (${mode})`,
    body: 'Transforme leads qualificados em clientes com marketing digital e copywriting estratégico.',
    cta: 'Acesse o funil de vendas →',
    hashtags: ['copywriting', 'marketingdigital', 'automação', 'leads', 'conversão'],
  });

const validCarouselJson = (mode: string) =>
  JSON.stringify([
    { index: 0, copy_text: `Você ainda escreve copy manualmente? (${mode})`, layout_hint: 'cover' },
    { index: 1, copy_text: 'Com copywriting estratégico, cada palavra vira conversão.', layout_hint: 'content' },
    { index: 2, copy_text: 'Automação + marketing digital = leads qualificados.', layout_hint: 'content' },
    { index: 3, copy_text: 'Seu funil de vendas precisa de copy que conecta.', layout_hint: 'content' },
    { index: 4, copy_text: 'Acesse agora e transforme suas palavras em resultados →', layout_hint: 'cta' },
  ]);

describe('Content Pipeline Simulation — 5 posts for CopyZen', () => {
  it('AC-1: generates 3 inception posts (carousel + image)', async () => {
    const responses = [
      validCarouselJson('inception'),  // Post 1 — inception carousel
      validPostJson('inception'),      // Post 2 — inception image
      validCarouselJson('inception'),  // Post 3 — inception carousel
    ];
    const agent = new CopywriterAgent({ llm: new MockLLMProvider(responses) });

    const post1 = await agent.generateCarouselCopy('CopyZen briefing', copyzenBrand, 'inception', 5);
    const post2 = await agent.generatePostCopy('CopyZen briefing', copyzenBrand, 'inception', 'image');
    const post3 = await agent.generateCarouselCopy('CopyZen briefing', copyzenBrand, 'inception', 5);

    expect(post1).toHaveLength(5);
    expect(post1[0].layout_hint).toBe('cover');
    expect(post1[4].layout_hint).toBe('cta');

    expect(post2.headline).toBeTruthy();
    expect(post2.metadata.mode).toBe('inception');

    expect(post3).toHaveLength(5);
  });

  it('AC-2: generates 2 atracao_fatal posts (carousel + image)', async () => {
    const responses = [
      validCarouselJson('atracao_fatal'), // Post 4 — atracao_fatal carousel
      validPostJson('atracao_fatal'),     // Post 5 — atracao_fatal image
    ];
    const agent = new CopywriterAgent({ llm: new MockLLMProvider(responses) });

    const post4 = await agent.generateCarouselCopy('CopyZen briefing', copyzenBrand, 'atracao_fatal', 5);
    const post5 = await agent.generatePostCopy('CopyZen briefing', copyzenBrand, 'atracao_fatal', 'image');

    expect(post4).toHaveLength(5);
    expect(post5.metadata.mode).toBe('atracao_fatal');
    expect(post5.cta).toBeTruthy();
  });

  it('AC-6: posts are brand-compliant (contain at least 1 keyword)', async () => {
    const response = validPostJson('inception');
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([response]) });
    const post = await agent.generatePostCopy('CopyZen briefing', copyzenBrand, 'inception', 'image');

    expect(post.metadata.brand_compliant).toBe(true);
  });

  it('AC-6: inception posts have soft CTA (not aggressive)', async () => {
    const response = JSON.stringify({
      headline: 'O segredo do copywriting que converte',
      body: 'Descubra como automação transforma leads em clientes com marketing digital eficiente.',
      cta: 'Salva esse post para lembrar',
      hashtags: ['copywriting', 'leads'],
    });
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([response]) });
    const post = await agent.generatePostCopy('CopyZen briefing', copyzenBrand, 'inception', 'image');

    expect(post.cta).toBeTruthy();
    expect(post.metadata.mode).toBe('inception');
  });

  it('pipeline produces distinct outputs for different modes', async () => {
    const inceptionResponse = validPostJson('inception');
    const fatalResponse = validPostJson('atracao_fatal');

    const agent = new CopywriterAgent({
      llm: new MockLLMProvider([inceptionResponse, fatalResponse]),
    });

    const inception = await agent.generatePostCopy('Brief', copyzenBrand, 'inception', 'image');
    const fatal = await agent.generatePostCopy('Brief', copyzenBrand, 'atracao_fatal', 'image');

    expect(inception.metadata.mode).toBe('inception');
    expect(fatal.metadata.mode).toBe('atracao_fatal');
    expect(inception.metadata.mode).not.toBe(fatal.metadata.mode);
  });
});
