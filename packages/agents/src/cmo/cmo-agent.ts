/**
 * CMO Agent — Full Implementation
 * Story 3.3 — AC-1, AC-2, AC-3, AC-4, AC-5
 */

import crypto from 'node:crypto';
import { Agent } from '../base/agent.js';
import type { AgentConfig } from '../base/agent.js';
import type { BrandConfig, ValidationResult } from '@copyzen/core';
import { validateBrandCompliance } from '@copyzen/core';
import type {
  ProposalOutput,
  SystemSurvey,
  ProjectPlan,
  ExecutionSequence,
  ReviewResult,
  AgentOutput,
  AgentTask,
  SystemType,
  PackageType,
} from './types.js';
import {
  buildAnalyzeBriefingSystemPrompt,
  buildAnalyzeBriefingUserPrompt,
} from './prompts/analyze-briefing.js';
import type { BriefingData } from './prompts/analyze-briefing.js';

// AC-3: CMO system prompt — role + orchestration guidelines
function buildCMOSystemPrompt(brandConfig?: BrandConfig): string {
  const brandSection = brandConfig
    ? `\nBRAND DO CLIENTE ATUAL:\n- Nome: ${brandConfig.client_id}\n- Tom: ${brandConfig.tone_of_voice}\n- Keywords: ${brandConfig.keywords.slice(0, 5).join(', ')}\n`
    : '';

  return `Você é o CMO (Chief Marketing Officer) da CopyZen, responsável por orquestrar a execução de projetos de marketing inteligente.${brandSection}
RESPONSABILIDADES:
1. Analisar briefings e recomendar pacotes de serviços
2. Criar planos de projeto detalhados com fases e timelines
3. Orquestrar tarefas para agentes Designer e Copywriter
4. Revisar outputs garantindo conformidade com a marca do cliente

DIRETRIZES DE ORQUESTRAÇÃO:
- Copywriter produz textos, copy e CTAs
- Designer produz layouts, assets visuais e componentes
- Sequência padrão: análise → copy → design → revisão
- Dependências entre tasks devem ser explícitas

PACOTES E SISTEMAS:
- IA: content generation apenas
- ART: content + funwheel
- E: content + funwheel + sales_page
- Combo Leads: IA + ART
- Combo Cash: ART + E

Responda sempre em português do Brasil. Retorne JSON válido quando solicitado.`;
}

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

// Maps package type to required systems
function getSystemsForPackage(pkg: PackageType): SystemType[] {
  const map: Record<PackageType, SystemType[]> = {
    ia: ['content'],
    art: ['content', 'funwheel'],
    e: ['content', 'funwheel', 'sales_page'],
    combo_leads: ['content', 'funwheel'],
    combo_cash: ['content', 'funwheel', 'sales_page'],
  };
  return map[pkg];
}

export class CMOAgent extends Agent {
  constructor(config: AgentConfig) {
    super(config);
  }

  // AC-2: analyzeBriefing — refactored to use LLMProvider
  async analyzeBriefing(briefingData: BriefingData): Promise<ProposalOutput> {
    const systemPrompt = buildAnalyzeBriefingSystemPrompt();
    const userPrompt = buildAnalyzeBriefingUserPrompt(briefingData);

    const response = await this.callLLM(systemPrompt, userPrompt, {
      maxTokens: 1024,
      temperature: 0.3,
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      return JSON.parse(jsonMatch[0]) as ProposalOutput;
    } catch {
      // Fallback: return safe default
      return {
        recommended_package: 'ia',
        reasoning: response.content.slice(0, 200),
        estimated_timeline: 'A definir',
        estimated_cost_range: 'A definir',
        priority_systems: ['content'],
        confidence: 0.5,
        needs_more_info: true,
        missing_info: ['Falha ao processar resposta do modelo'],
      };
    }
  }

  // AC-2: createProjectPlan
  async createProjectPlan(
    clientId: string | null,
    packageType: PackageType,
    systemSurveys: SystemSurvey[],
    brandConfig?: BrandConfig,
  ): Promise<ProjectPlan> {
    const systems = getSystemsForPackage(packageType);
    const surveySummary = systemSurveys
      .map((s) => `${s.system}: ${JSON.stringify(s.answers)}`)
      .join('\n');

    const systemPrompt = buildCMOSystemPrompt(brandConfig);
    const userPrompt = `Crie um plano de projeto detalhado para o pacote "${packageType}" com os seguintes sistemas: ${systems.join(', ')}.

DADOS DOS SURVEYS:
${surveySummary}

Retorne JSON com esta estrutura:
{
  "estimated_timeline": "X semanas",
  "phases": [
    {
      "phase": 1,
      "name": "Nome da fase",
      "systems": ["content"],
      "tasks": ["Tarefa 1", "Tarefa 2"]
    }
  ]
}`;

    const response = await this.callLLM(systemPrompt, userPrompt, {
      maxTokens: 1500,
      temperature: 0.2,
    });

    let planDetails: { estimated_timeline: string; phases: ProjectPlan['phases'] };
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');
      planDetails = JSON.parse(jsonMatch[0]);
    } catch {
      planDetails = {
        estimated_timeline: '4-6 semanas',
        phases: [
          { phase: 1, name: 'Análise e Planejamento', systems, tasks: ['Definir estratégia'] },
          { phase: 2, name: 'Produção', systems, tasks: ['Criar conteúdo'] },
          { phase: 3, name: 'Revisão e Entrega', systems, tasks: ['Revisar e publicar'] },
        ],
      };
    }

    return {
      id: crypto.randomUUID(),
      client_id: clientId,
      package: packageType,
      systems,
      estimated_timeline: planDetails.estimated_timeline,
      phases: planDetails.phases,
      created_at: new Date().toISOString(),
    };
  }

  // AC-4: orchestrateExecution — generates AgentTask[] sequence
  async orchestrateExecution(projectPlan: ProjectPlan): Promise<ExecutionSequence> {
    const tasks: AgentTask[] = [];
    let order = 1;

    for (const system of projectPlan.systems) {
      // Copywriter tasks come first
      if (system === 'content') {
        tasks.push({
          id: `task-${order}`,
          agent: 'copywriter',
          action: 'generate_social_content',
          inputs: { system, package: projectPlan.package, client_id: projectPlan.client_id },
          outputs: ['posts_draft', 'captions', 'hashtags'],
          order: order++,
          dependencies: [],
        });
      }

      if (system === 'funwheel') {
        const copyTaskId = `task-${order - 1}`;
        tasks.push({
          id: `task-${order}`,
          agent: 'copywriter',
          action: 'generate_funwheel_copy',
          inputs: { system, package: projectPlan.package, client_id: projectPlan.client_id },
          outputs: ['art_texts', 'cta_copy', 'viral_hook'],
          order: order++,
          dependencies: [],
        });
        tasks.push({
          id: `task-${order}`,
          agent: 'designer',
          action: 'build_funwheel_pages',
          inputs: {
            system,
            copy_task_id: copyTaskId,
            client_id: projectPlan.client_id,
          },
          outputs: ['art_page_html', 'rt_page_html', 'funwheel_assets'],
          order: order++,
          dependencies: [`task-${order - 2}`],
        });
      }

      if (system === 'sales_page') {
        tasks.push({
          id: `task-${order}`,
          agent: 'copywriter',
          action: 'generate_sales_copy',
          inputs: { system, package: projectPlan.package, client_id: projectPlan.client_id },
          outputs: ['headline', 'body_copy', 'testimonials_placeholder', 'cta'],
          order: order++,
          dependencies: [],
        });
        tasks.push({
          id: `task-${order}`,
          agent: 'designer',
          action: 'build_sales_page',
          inputs: {
            system,
            copy_task_id: `task-${order - 1}`,
            client_id: projectPlan.client_id,
          },
          outputs: ['sales_page_html', 'sales_page_assets'],
          order: order++,
          dependencies: [`task-${order - 2}`],
        });
      }
    }

    // Final CMO review task
    tasks.push({
      id: `task-${order}`,
      agent: 'cmo',
      action: 'review_all_outputs',
      inputs: { project_plan_id: projectPlan.id, client_id: projectPlan.client_id },
      outputs: ['review_report', 'approval_status'],
      order: order,
      dependencies: tasks.map((t) => t.id),
    });

    return {
      project_plan_id: projectPlan.id,
      tasks,
      total_tasks: tasks.length,
    };
  }

  // AC-5: reviewOutput
  async reviewOutput(output: AgentOutput, brandConfig: BrandConfig): Promise<ReviewResult> {
    const compliance: ValidationResult = validateBrandCompliance(output.content, brandConfig);

    if (!compliance.compliant) {
      return {
        verdict: 'revision_needed',
        feedback: `Output não está em conformidade com a marca. Problemas: ${compliance.issues.join('; ')}`,
        compliance,
      };
    }

    // Secondary review via LLM for qualitative assessment
    const systemPrompt = buildCMOSystemPrompt(brandConfig);
    const userPrompt = `Revise o seguinte output de ${output.agent} (ação: ${output.action}) e avalie a qualidade:

OUTPUT:
${output.content.slice(0, 2000)}

Responda com JSON:
{
  "verdict": "approved" | "revision_needed",
  "feedback": "Feedback construtivo em 1-2 frases"
}`;

    try {
      const response = await this.callLLM(systemPrompt, userPrompt, {
        maxTokens: 300,
        temperature: 0.1,
      });
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const llmVerdict = JSON.parse(jsonMatch[0]) as { verdict: ReviewResult['verdict']; feedback: string };
        return { ...llmVerdict, compliance };
      }
    } catch {
      // fall through to auto-approve when compliant
    }

    return {
      verdict: 'approved',
      feedback: 'Output aprovado — conformidade com a marca verificada.',
      compliance,
    };
  }

  // Utility: build execution log entry
  buildExecutionLog(
    agent: AgentOutput['agent'],
    action: string,
    clientId: string | null,
    inputData: unknown,
    outputData: unknown,
    tokensUsed: number,
    latencyMs: number,
    costEstimate: number,
    model: string,
  ) {
    return {
      agent,
      action,
      client_id: clientId,
      input_hash: sha256(JSON.stringify(inputData)),
      output_hash: sha256(JSON.stringify(outputData)),
      tokens_used: tokensUsed,
      latency_ms: latencyMs,
      cost_estimate: costEstimate,
      model,
      timestamp: new Date().toISOString(),
    };
  }
}
