/**
 * CopywriterAgent.generateSalesPageContent — Unit Tests
 * Story 6.2 — AC-5
 */

import { describe, it, expect } from 'vitest';
import { CopywriterAgent } from '../copywriter-agent.js';
import { MockLLMProvider } from '../../llm/factory.js';
import type { BrandConfig } from '@copyzen/core';
import type { SalesStrategy } from '../../cmo/prompts/sales-strategy.js';

const mockBrand: BrandConfig = {
  id: 'brand-sp-1',
  client_id: 'client-sp-1',
  primary_color: '#FF5500',
  secondary_color: '#0055FF',
  accent_color: '#FFD700',
  background_color: '#FFFFFF',
  text_color: '#1A1A1A',
  heading_font: 'Inter',
  body_font: 'Inter',
  tone_of_voice: 'formal',
  custom_guidelines: null,
  logo_url: null,
  slogan: 'Resultados reais',
  keywords: ['inovação', 'resultados', 'crescimento', 'digital', 'qualidade'],
  reference_images: [],
};

const mockStrategy: SalesStrategy = {
  angle: 'dor de perder clientes por falta de copy eficiente',
  usp: 'Único sistema que combina IA + copywriting humano para o mercado brasileiro',
  main_objections: ['Preço muito alto', 'Não tenho tempo para implementar', 'Já tentei outros sistemas'],
  social_proof_angle: 'resultados financeiros mensuráveis',
  target_emotion: 'medo de perder oportunidade de mercado',
};

const validSalesPageContentJson = JSON.stringify({
  hero: {
    headline: 'Pare de Perder Clientes por Falta de Copy que Converte',
    subheadline: 'O sistema de copywriting com IA que já gerou inovação e resultados para mais de 500 negócios digitais.',
    cta_text: 'Quero Resultados Agora →',
  },
  problem: {
    text: 'Você trabalha muito mas as vendas não acompanham o esforço. O problema não é o produto — é o copy.',
    pain_points: [
      'Copy genérico que não converte',
      'Tempo desperdiçado escrevendo textos que ninguém lê',
      'Concorrentes com menos qualidade vendendo mais',
      'Leads que somem sem explicação',
    ],
  },
  solution: {
    text: 'CopyZen Pro combina IA avançada com técnicas de copywriting comprovadas para gerar crescimento real.',
    value_props: [
      'Copy gerado em minutos, não semanas',
      'Personalizado para o mercado digital brasileiro',
      'Resultados mensuráveis desde o primeiro mês',
      'Inovação constante baseada em dados',
    ],
  },
  benefits: [
    { title: 'Mais Conversões', description: 'Aumente sua taxa de fechamento com copy persuasivo e personalizado.' },
    { title: 'Mais Tempo', description: 'Automatize a criação de copy e foque no que realmente importa.' },
    { title: 'Mais Autoridade', description: 'Posicione-se como referência no seu nicho com conteúdo de qualidade.' },
    { title: 'Mais Leads', description: 'Atraia clientes qualificados com mensagens que ressoam com sua audiência.' },
    { title: 'Mais Inovação', description: 'Mantenha-se à frente com tecnologia de ponta no seu marketing digital.' },
    { title: 'Mais Resultados', description: 'Veja o crescimento real no seu faturamento mês após mês.' },
  ],
  social_proof: [
    { quote: 'Triplicamos nossas conversões em 60 dias usando CopyZen Pro.', author: 'Carlos Mendes', role: 'Empresário Digital' },
    { quote: 'Finalmente um sistema de inovação que entrega resultados reais.', author: 'Ana Silva', role: 'Consultora de Marketing' },
    { quote: 'O melhor investimento que fiz para o crescimento do meu negócio.', author: 'Roberto Lima', role: 'Coach de Negócios' },
  ],
  offer: {
    title: 'Tudo Que Você Precisa para Converter Mais',
    items: [
      'Acesso ilimitado ao gerador de copy com IA',
      'Templates de alta conversão para todos os nichos',
      'Dashboard de resultados em tempo real',
      'Suporte prioritário por 90 dias',
      'Bônus: Curso de Copywriting Digital',
    ],
    price_display: 'R$ 997',
  },
  guarantee: {
    text: 'Garantia total de satisfação. Se em 30 dias você não ver resultados, devolvemos 100% do seu investimento.',
    duration: '30 dias',
  },
  faq: [
    { question: 'Para quem é o CopyZen Pro?', answer: 'Para empreendedores digitais, coaches, consultores e profissionais que querem aumentar suas conversões.' },
    { question: 'Em quanto tempo vejo resultados?', answer: 'A maioria dos clientes vê crescimento nas primeiras 2 semanas de uso.' },
    { question: 'Preciso saber escrever copy?', answer: 'Não! Nossa IA cuida de tudo. Você só precisa fornecer as informações do seu negócio.' },
    { question: 'E se não funcionar para mim?', answer: 'Você tem 30 dias de garantia total. Sem perguntas, sem burocracia.' },
  ],
  final_cta: {
    headline: 'A Hora de Transformar Seus Resultados é Agora',
    urgency: 'Vagas limitadas para este mês. Não deixe seus concorrentes saírem na frente.',
    button_text: 'Garantir Minha Vaga com Desconto →',
  },
});

describe('CopywriterAgent.generateSalesPageContent', () => {
  it('AC-2: returns SalesPageContent with all 9 sections', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validSalesPageContentJson]) });
    const result = await agent.generateSalesPageContent('Brief de teste', mockBrand);

    expect(result).toHaveProperty('hero');
    expect(result).toHaveProperty('problem');
    expect(result).toHaveProperty('solution');
    expect(result).toHaveProperty('benefits');
    expect(result).toHaveProperty('social_proof');
    expect(result).toHaveProperty('offer');
    expect(result).toHaveProperty('guarantee');
    expect(result).toHaveProperty('faq');
    expect(result).toHaveProperty('final_cta');
    expect(result).toHaveProperty('metadata');
  });

  it('AC-2: hero section has required fields', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validSalesPageContentJson]) });
    const result = await agent.generateSalesPageContent('Brief', mockBrand);

    expect(result.hero.headline).toBeTruthy();
    expect(result.hero.subheadline).toBeTruthy();
    expect(result.hero.cta_text).toBeTruthy();
  });

  it('AC-2: problem section has pain_points array', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validSalesPageContentJson]) });
    const result = await agent.generateSalesPageContent('Brief', mockBrand);

    expect(Array.isArray(result.problem.pain_points)).toBe(true);
    expect(result.problem.pain_points.length).toBeGreaterThan(0);
  });

  it('AC-2: benefits is an array of objects with title and description', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validSalesPageContentJson]) });
    const result = await agent.generateSalesPageContent('Brief', mockBrand);

    expect(Array.isArray(result.benefits)).toBe(true);
    expect(result.benefits.length).toBeGreaterThan(0);
    expect(result.benefits[0]).toHaveProperty('title');
    expect(result.benefits[0]).toHaveProperty('description');
  });

  it('AC-2: social_proof is an array of quotes with author and role', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validSalesPageContentJson]) });
    const result = await agent.generateSalesPageContent('Brief', mockBrand);

    expect(Array.isArray(result.social_proof)).toBe(true);
    expect(result.social_proof[0]).toHaveProperty('quote');
    expect(result.social_proof[0]).toHaveProperty('author');
    expect(result.social_proof[0]).toHaveProperty('role');
  });

  it('AC-2: faq is an array with question and answer', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validSalesPageContentJson]) });
    const result = await agent.generateSalesPageContent('Brief', mockBrand);

    expect(Array.isArray(result.faq)).toBe(true);
    expect(result.faq[0]).toHaveProperty('question');
    expect(result.faq[0]).toHaveProperty('answer');
  });

  it('AC-5: brand compliance validated — true for compliant copy', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validSalesPageContentJson]) });
    const result = await agent.generateSalesPageContent('Brief', mockBrand);

    expect(result.metadata).toHaveProperty('brand_compliant');
    expect(result.metadata.brand_compliant).toBe(true);
  });

  it('AC-3: accepts strategy from CMO and lead count without errors', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider([validSalesPageContentJson]) });
    const result = await agent.generateSalesPageContent('Brief', mockBrand, mockStrategy, 247);

    // Should still return all 9 sections
    expect(result.hero).toBeDefined();
    expect(result.final_cta).toBeDefined();
  });

  it('falls back gracefully when LLM returns invalid JSON', async () => {
    const agent = new CopywriterAgent({ llm: new MockLLMProvider(['texto inválido sem JSON']) });
    const result = await agent.generateSalesPageContent('Brief', mockBrand);

    // Fallback values should be non-empty
    expect(result.hero.headline).toBeTruthy();
    expect(result.problem.pain_points.length).toBeGreaterThan(0);
    expect(result.benefits.length).toBeGreaterThan(0);
    expect(result.faq.length).toBeGreaterThan(0);
    expect(result.metadata).toHaveProperty('brand_compliant');
  });
});
