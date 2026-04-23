/**
 * AI Library - Addvalu Copiloto Executivo
 * Exporta todos os módulos da arquitetura de IA
 */

// System Prompt
export { SYSTEM_PROMPT, INTENT_DESCRIPTIONS, type Intent } from './systemPrompt';

// Intent Detection
export { detectIntent, detectResponseMode } from './detectIntent';

// Conversation Memory
export {
  createEmptyMemory,
  updateConversationMemory,
  enrichQuestionWithMemory,
  type ConversationMemory,
} from './conversationMemory';

// Operational Insights
export {
  generateOperationalInsights,
  generateAlerts,
  type Insight,
} from './generateOperationalInsights';

// Priority Recommendations
export {
  generatePriorityRecommendations,
  generateDirectorateRecommendations,
  type Priority,
} from './generatePriorityRecommendations';

// Executive Context
export {
  buildExecutiveContext,
  formatContextForAI,
  type ExecutiveContext,
} from './buildExecutiveContext';

// Orchestrator
export {
  runExecutiveCopilot,
  formatResponseForDisplay,
  type OrchestratorInput,
  type OrchestratorOutput,
} from './orchestrator';
