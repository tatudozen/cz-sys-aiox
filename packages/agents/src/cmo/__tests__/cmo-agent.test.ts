/**
 * CMO Agent Unit Tests — Story 3.3
 * AC-7: orchestrate plan → tasks corretas por agente → review aprovado/rejeitado
 */

import { describe, it, expect } from 'vitest';
import { CMOAgent } from '../cmo-agent.js';
import { MockLLMProvider } from '../../llm/factory.js';
import type { ProjectPlan, AgentOutput } from '../types.js';
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

const mockProjectPlan: ProjectPlan = {
  id: 'plan-1',
  client_id: 'client-1',
  package: 'art',
  systems: ['content', 'funwheel'],
  estimated_timeline: '4 semanas',
  phases: [
    { phase: 1, name: 'Análise', systems: ['content'], tasks: ['Definir estratégia'] },
    { phase: 2, name: 'Produção', systems: ['content', 'funwheel'], tasks: ['Criar conteúdo'] },
  ],
  created_at: new Date().toISOString(),
};

describe('CMOAgent.orchestrateExecution', () => {
  it('generates tasks for content system', async () => {
    const agent = new CMOAgent({ llm: new MockLLMProvider() });
    const plan: ProjectPlan = { ...mockProjectPlan, systems: ['content'] };
    const result = await agent.orchestrateExecution(plan);

    expect(result.project_plan_id).toBe('plan-1');
    expect(result.tasks.length).toBeGreaterThan(0);

    const copywriterTasks = result.tasks.filter((t) => t.agent === 'copywriter');
    expect(copywriterTasks.length).toBeGreaterThan(0);
    expect(copywriterTasks[0].action).toBe('generate_social_content');
  });

  it('generates designer tasks for funwheel system', async () => {
    const agent = new CMOAgent({ llm: new MockLLMProvider() });
    const result = await agent.orchestrateExecution(mockProjectPlan);

    const designerTasks = result.tasks.filter((t) => t.agent === 'designer');
    expect(designerTasks.length).toBeGreaterThan(0);
    expect(designerTasks[0].action).toBe('build_funwheel_pages');
  });

  it('designer tasks depend on copywriter tasks', async () => {
    const agent = new CMOAgent({ llm: new MockLLMProvider() });
    const result = await agent.orchestrateExecution(mockProjectPlan);

    const designerTask = result.tasks.find((t) => t.agent === 'designer');
    expect(designerTask?.dependencies.length).toBeGreaterThan(0);
  });

  it('final task is CMO review', async () => {
    const agent = new CMOAgent({ llm: new MockLLMProvider() });
    const result = await agent.orchestrateExecution(mockProjectPlan);

    const lastTask = result.tasks[result.tasks.length - 1];
    expect(lastTask.agent).toBe('cmo');
    expect(lastTask.action).toBe('review_all_outputs');
  });

  it('generates tasks for sales_page system', async () => {
    const agent = new CMOAgent({ llm: new MockLLMProvider() });
    const plan: ProjectPlan = { ...mockProjectPlan, package: 'e', systems: ['content', 'funwheel', 'sales_page'] };
    const result = await agent.orchestrateExecution(plan);

    const salesCopyTasks = result.tasks.filter((t) => t.action === 'generate_sales_copy');
    const salesPageTasks = result.tasks.filter((t) => t.action === 'build_sales_page');
    expect(salesCopyTasks.length).toBe(1);
    expect(salesPageTasks.length).toBe(1);
  });

  it('total_tasks matches tasks array length', async () => {
    const agent = new CMOAgent({ llm: new MockLLMProvider() });
    const result = await agent.orchestrateExecution(mockProjectPlan);

    expect(result.total_tasks).toBe(result.tasks.length);
  });
});

describe('CMOAgent.reviewOutput', () => {
  it('approves compliant output', async () => {
    const agent = new CMOAgent({
      llm: new MockLLMProvider(['{"verdict":"approved","feedback":"Ótimo conteúdo sobre marketing e automação."}']),
    });

    const output: AgentOutput = {
      agent: 'copywriter',
      action: 'generate_social_content',
      content:
        'Descubra como o marketing com inteligência artificial e automação podem transformar suas vendas e copy. ' +
        'Nossa plataforma oferece recursos avançados de análise e geração de conteúdo para empresas que buscam ' +
        'escalar seus resultados com tecnologia de ponta. A automação inteligente reduz custos operacionais e ' +
        'aumenta a eficiência dos times de marketing, gerando leads qualificados com estratégias orientadas por dados.',
      client_id: 'client-1',
      created_at: new Date().toISOString(),
    };

    const result = await agent.reviewOutput(output, mockBrand);
    expect(result.compliance.compliant).toBe(true);
  });

  it('rejects non-compliant output — no keywords', async () => {
    const agent = new CMOAgent({ llm: new MockLLMProvider() });

    const output: AgentOutput = {
      agent: 'copywriter',
      action: 'generate_social_content',
      content: 'Compre agora e ganhe desconto especial nesta promoção exclusiva!',
      client_id: 'client-1',
      created_at: new Date().toISOString(),
    };

    const result = await agent.reviewOutput(output, mockBrand);
    expect(result.verdict).toBe('revision_needed');
    expect(result.compliance.compliant).toBe(false);
  });

  it('returns review result structure', async () => {
    const agent = new CMOAgent({ llm: new MockLLMProvider() });
    const output: AgentOutput = {
      agent: 'designer',
      action: 'build_funwheel_pages',
      content: 'marketing automação copy vendas inteligência artificial',
      client_id: null,
      created_at: new Date().toISOString(),
    };

    const result = await agent.reviewOutput(output, mockBrand);
    expect(result).toHaveProperty('verdict');
    expect(result).toHaveProperty('feedback');
    expect(result).toHaveProperty('compliance');
    expect(['approved', 'revision_needed']).toContain(result.verdict);
  });
});

describe('CMOAgent.buildExecutionLog', () => {
  it('builds execution log with hashes', () => {
    const agent = new CMOAgent({ llm: new MockLLMProvider() });
    const log = agent.buildExecutionLog(
      'cmo',
      'analyze-briefing',
      'client-1',
      { briefing: 'test' },
      { result: 'ia' },
      100,
      500,
      0.001,
      'claude-sonnet-4-6',
    );

    expect(log.agent).toBe('cmo');
    expect(log.input_hash).toBeTruthy();
    expect(log.output_hash).toBeTruthy();
    expect(log.tokens_used).toBe(100);
    expect(log.latency_ms).toBe(500);
  });
});
