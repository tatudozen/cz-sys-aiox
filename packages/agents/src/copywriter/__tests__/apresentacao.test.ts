/**
 * ApresentacaoCopy Tests — Story 5.2
 * AC-2: CopywriterAgent.generateApresentacaoCopy → validates structure
 */

import { describe, it, expect } from 'vitest';
import { CopywriterAgent } from '../copywriter-agent.js';
import { MockLLMProvider } from '../../llm/factory.js';
import type { BrandConfig } from '@copyzen/core';

const mockBrand: BrandConfig = {
  id: 'brand-5',
  client_id: 'client-5',
  primary_color: '#08164a',
  secondary_color: '#38bafc',
  accent_color: '#38bafc',
  background_color: '#ffffff',
  text_color: '#1a202c',
  heading_font: 'Montserrat',
  body_font: 'Open Sans',
  tone_of_voice: 'casual',
  custom_guidelines: null,
  logo_url: null,
  slogan: 'Marketing inteligente para todos',
  keywords: ['marketing', 'copywriting', 'transformação', 'leads', 'conversão'],
  reference_images: [],
};

const validApresentacaoJson = JSON.stringify({
  hero: {
    headline: 'Transforme Seu Marketing com Inteligência',
    subheadline: 'Atraia os clientes certos com estratégias comprovadas',
  },
  problem: {
    text: 'Muitos empreendedores lutam para se posicionar corretamente no mercado digital.',
    pain_points: [
      'Dificuldade em atrair clientes qualificados',
      'Marketing sem método e sem previsibilidade',
      'Mensagem que não ressoa com o público-alvo',
    ],
  },
  journey: [
    { step: 1, title: 'Diagnóstico', description: 'Entendemos onde você está hoje.' },
    { step: 2, title: 'Estratégia', description: 'Criamos um plano personalizado para você.' },
    { step: 3, title: 'Execução', description: 'Implementamos com suporte completo.' },
    { step: 4, title: 'Resultados', description: 'Você vê os resultados acontecendo.' },
  ],
  solution: {
    text: 'Nossa metodologia combina copywriting avançado com automação inteligente para gerar resultados consistentes.',
    value_props: [
      'Copywriting personalizado para sua marca',
      'Automação que trabalha enquanto você dorme',
      'Métricas claras a cada etapa',
    ],
  },
  cta: { text: 'Quero Começar Agora →' },
  metadata: { brand_compliant: true },
});

describe('CopywriterAgent.generateApresentacaoCopy', () => {
  it('returns correct structure with hero, problem, journey, solution, cta', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validApresentacaoJson]) });
    const result = await agent.generateApresentacaoCopy('Empresa de marketing digital', mockBrand);

    expect(result.hero).toBeDefined();
    expect(typeof result.hero.headline).toBe('string');
    expect(typeof result.hero.subheadline).toBe('string');
  });

  it('problem section has text and pain_points array', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validApresentacaoJson]) });
    const result = await agent.generateApresentacaoCopy('Test brief', mockBrand);

    expect(result.problem).toBeDefined();
    expect(typeof result.problem.text).toBe('string');
    expect(Array.isArray(result.problem.pain_points)).toBe(true);
    expect(result.problem.pain_points.length).toBeGreaterThan(0);
  });

  it('journey has 4 steps with step number, title, description', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validApresentacaoJson]) });
    const result = await agent.generateApresentacaoCopy('Test brief', mockBrand);

    expect(Array.isArray(result.journey)).toBe(true);
    expect(result.journey).toHaveLength(4);
    result.journey.forEach((step, index) => {
      expect(step.step).toBe(index + 1);
      expect(typeof step.title).toBe('string');
      expect(typeof step.description).toBe('string');
    });
  });

  it('solution section has text and value_props', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validApresentacaoJson]) });
    const result = await agent.generateApresentacaoCopy('Test brief', mockBrand);

    expect(result.solution).toBeDefined();
    expect(typeof result.solution.text).toBe('string');
    expect(Array.isArray(result.solution.value_props)).toBe(true);
  });

  it('cta has text string', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validApresentacaoJson]) });
    const result = await agent.generateApresentacaoCopy('Test brief', mockBrand);

    expect(result.cta).toBeDefined();
    expect(typeof result.cta.text).toBe('string');
    expect(result.cta.text.length).toBeGreaterThan(0);
  });

  it('metadata has brand_compliant boolean', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validApresentacaoJson]) });
    const result = await agent.generateApresentacaoCopy('Test brief', mockBrand);

    expect(result.metadata).toBeDefined();
    expect(typeof result.metadata.brand_compliant).toBe('boolean');
  });

  it('uses fallback when LLM returns invalid JSON', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider(['not valid json at all']) });
    const result = await agent.generateApresentacaoCopy('Test brief', mockBrand);

    // Should return fallback values — structure must be valid regardless of compliance
    expect(result.hero.headline).toBeTruthy();
    expect(result.journey.length).toBe(4);
    expect(typeof result.metadata.brand_compliant).toBe('boolean');
  });
});
