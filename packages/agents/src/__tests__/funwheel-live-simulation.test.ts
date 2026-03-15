/**
 * FunWheel Live — Content Generation Simulation
 * Story 7.3 — AC-1, AC-2 (simulated with MockLLMProvider)
 *
 * Validates that the 3 FunWheel pages (apresentacao, retencao, transformacao)
 * can be generated for CopyZen with the correct structure and brand compliance.
 */

import { describe, it, expect } from 'vitest';
import { CopywriterAgent } from '../copywriter/copywriter-agent.js';
import { MockLLMProvider } from '../llm/factory.js';
import type { BrandConfig } from '@copyzen/core';

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
  custom_guidelines: 'Tom conversacional. Use "você". Foque em resultados concretos.',
  logo_url: null,
  slogan: 'Copy que conecta. Resultados que importam.',
  keywords: ['copywriting', 'marketing digital', 'automação', 'funil de vendas', 'leads', 'conversão'],
  reference_images: [],
};

const apresJson = JSON.stringify({
  hero: { headline: 'O copywriting que converte leads em clientes', subheadline: 'Automatize sua automação de marketing digital.' },
  problem: { text: 'Você perde leads todo dia porque o seu funil de vendas não está otimizado.', pain_points: ['Copy sem personalidade', 'Baixa conversão', 'Sem automação', 'Sem leads qualificados'] },
  journey: [
    { step: 1, title: 'Diagnóstico', description: 'Identificamos as dores do seu público com copywriting estratégico.' },
    { step: 2, title: 'Estratégia', description: 'Criamos o funil de vendas certo para seus leads.' },
    { step: 3, title: 'Execução', description: 'Automação e copy gerados em minutos.' },
    { step: 4, title: 'Resultados', description: 'Conversão real e mensurada.' },
  ],
  solution: { text: 'CopyZen Pro automatiza seu marketing digital com IA.', value_props: ['Copy gerado em minutos', 'Funil de vendas completo', 'Automação sem complicação', 'Leads qualificados'] },
  cta: { text: 'Quero ver como funciona →' },
  metadata: { brand_compliant: true },
});

const retencaoJson = JSON.stringify({
  page_type: 'retencao',
  headline: 'Descubra por que seus leads não convertem',
  subheadline: 'E como o copywriting com IA pode mudar isso.',
  body_sections: [
    { title: 'O problema', content: 'Sem automação e copy estratégico, você perde leads todos os dias.' },
    { title: 'A solução', content: 'CopyZen Pro conecta marketing digital com conversão real.' },
  ],
  cta: 'Quero meu plano personalizado →',
  metadata: { page_type: 'retencao', brand_compliant: true },
});

const transformacaoJson = JSON.stringify({
  page_type: 'transformacao',
  headline: 'Transforme seu copywriting em conversão real',
  subheadline: 'Funil de vendas + automação + leads qualificados.',
  body_sections: [
    { title: 'Resultados', content: 'Nossos clientes aumentaram sua conversão em até 3x.' },
  ],
  cta: 'Garantir minha vaga no CopyZen Pro →',
  metadata: { page_type: 'transformacao', brand_compliant: true },
});

describe('FunWheel CopyZen — 3-page content generation (AC-1, AC-2)', () => {
  it('generates Apresentação page with correct structure', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([apresJson]) });
    const result = await agent.generateApresentacaoCopy('CopyZen briefing', copyzenBrand);

    expect(result.hero.headline).toBeTruthy();
    expect(Array.isArray(result.problem.pain_points)).toBe(true);
    expect(result.journey.length).toBe(4);
    expect(result.cta.text).toBeTruthy();
  });

  it('generates Retenção page with correct page_type', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([retencaoJson]) });
    const result = await agent.generateLandingPageCopy('CopyZen briefing', copyzenBrand, 'retencao');

    expect(result.page_type).toBe('retencao');
    expect(result.headline).toBeTruthy();
    expect(result.cta).toBeTruthy();
  });

  it('generates Transformação page with correct page_type', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([transformacaoJson]) });
    const result = await agent.generateLandingPageCopy('CopyZen briefing', copyzenBrand, 'transformacao');

    expect(result.page_type).toBe('transformacao');
    expect(result.headline).toBeTruthy();
  });

  it('all 3 pages are brand-compliant', async () => {
    const responses = [apresJson, retencaoJson, transformacaoJson];
    const agent = new CopywriterAgent({ llm: new MockLLMProvider(responses) });

    const apres = await agent.generateApresentacaoCopy('Brief', copyzenBrand);
    const ret = await agent.generateLandingPageCopy('Brief', copyzenBrand, 'retencao');
    const trans = await agent.generateLandingPageCopy('Brief', copyzenBrand, 'transformacao');

    expect(apres.metadata.brand_compliant).toBe(true);
    expect(ret.metadata.brand_compliant).toBe(true);
    expect(trans.metadata.brand_compliant).toBe(true);
  });
});
