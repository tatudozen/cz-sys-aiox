// @copyzen/agents — LLM + Agent implementation (Epic 3)
export * from './llm/index.js';
export { Agent } from './base/agent.js';
export type { AgentConfig } from './base/agent.js';
export { CMOAgent } from './cmo/cmo-agent.js';
export { CopywriterAgent } from './copywriter/copywriter-agent.js';
export type { PostCopy, LandingPageCopy, SalesPageCopy, CarouselSlide, CopyMode, PostType, PageType, ApresentacaoCopy, JourneyStep } from './copywriter/types.js';
export { DesignerAgent } from './designer/designer-agent.js';
export type { DesignerBrandTheme, DesignerOutput, ImageFormat } from './designer/types.js';
export type {
  ProposalOutput,
  SystemSurvey,
  ProjectPlan,
  ProjectPhase,
  AgentTask,
  ExecutionSequence,
  ReviewResult,
  AgentOutput,
  AgentExecutionLog,
  PackageType,
  SystemType,
  AgentRole,
} from './cmo/types.js';
