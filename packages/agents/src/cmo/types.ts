/**
 * CMO Agent — Domain Types
 * Story 3.3 — AC-2, AC-4, AC-5
 */

import type { ValidationResult } from '@copyzen/core';

export type PackageType = 'ia' | 'art' | 'e' | 'combo_leads' | 'combo_cash';
export type SystemType = 'content' | 'funwheel' | 'sales_page';
export type AgentRole = 'cmo' | 'copywriter' | 'designer';

// AC-2: analyzeBriefing output
export interface ProposalOutput {
  recommended_package: PackageType;
  reasoning: string;
  estimated_timeline: string;
  estimated_cost_range: string;
  priority_systems: SystemType[];
  confidence: number;
  needs_more_info: boolean;
  missing_info?: string[];
}

// AC-2: createProjectPlan inputs
export interface SystemSurvey {
  system: SystemType;
  answers: Record<string, string>;
}

// AC-4: AgentTask — atomic unit of work for an agent
export interface AgentTask {
  id: string;
  agent: AgentRole;
  action: string;
  inputs: Record<string, unknown>;
  outputs: string[];
  order: number;
  dependencies: string[];
}

// AC-2: createProjectPlan output
export interface ProjectPlan {
  id: string;
  client_id: string | null;
  package: PackageType;
  systems: SystemType[];
  estimated_timeline: string;
  phases: ProjectPhase[];
  created_at: string;
}

export interface ProjectPhase {
  phase: number;
  name: string;
  systems: SystemType[];
  tasks: string[];
}

// AC-4: orchestrateExecution output
export interface ExecutionSequence {
  project_plan_id: string;
  tasks: AgentTask[];
  total_tasks: number;
}

// AC-5: reviewOutput output
export interface ReviewResult {
  verdict: 'approved' | 'revision_needed';
  feedback: string;
  compliance: ValidationResult;
}

// AC-7: AgentOutput
export interface AgentOutput {
  agent: AgentRole;
  action: string;
  content: string;
  client_id: string | null;
  created_at: string;
}

// Task 4: AgentExecutionLog
export interface AgentExecutionLog {
  id?: string;
  agent: AgentRole;
  action: string;
  client_id: string | null;
  input_hash: string;
  output_hash: string;
  tokens_used: number;
  latency_ms: number;
  cost_estimate: number;
  model: string;
  timestamp: string;
}
