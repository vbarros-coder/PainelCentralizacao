import { ConversationMemory } from '@/features/ai/types';
import { resolveFollowUp } from './followUpToolResolver';

export type AddvaluTool = 
  | 'getCompletedProjects'
  | 'getActiveProjects'
  | 'getPlanningProjects'
  | 'getDelayedProjects'
  | 'getCriticalProjects'
  | 'getProjectsByDirectorate'
  | 'getProjectsByOwner'
  | 'getProjectDetails'
  | 'getPanels'
  | 'getAvailableUsers'
  | 'getExecutiveSummary'
  | 'getRecentChanges'
  | 'getAlerts'
  | 'summarizeRisks'
  | 'general_query';

export function routeQuestionToTool(question: string, memory: ConversationMemory): AddvaluTool {
  const msg = question.toLowerCase();

  // 1. Verificar se é um Follow-up
  const followUpTool = resolveFollowUp(question, memory);
  if (followUpTool) return followUpTool as AddvaluTool;

  // 2. Mapeamento de Intenções Diretas
  
  // Projetos Concluídos
  if (msg.includes('concluído') || msg.includes('finalizado') || msg.includes('terminado')) {
    return 'getCompletedProjects';
  }

  // Projetos Ativos
  if (msg.includes('ativo') || msg.includes('em andamento') || msg.includes('execução')) {
    return 'getActiveProjects';
  }

  // Projetos em Planejamento
  if (msg.includes('planejamento') || msg.includes('em projeto') || msg.includes('planejado')) {
    return 'getPlanningProjects';
  }

  // Projetos Atrasados
  if (msg.includes('atraso') || msg.includes('atrasado') || msg.includes('fora do prazo')) {
    return 'getDelayedProjects';
  }

  // Projetos Críticos / Riscos
  if (msg.includes('crítico') || msg.includes('risco') || msg.includes('perigo') || msg.includes('problema')) {
    if (msg.includes('resumo') || msg.includes('sumário')) return 'summarizeRisks';
    return 'getCriticalProjects';
  }

  // Agrupamentos Diretos
  if (msg.includes('por diretoria')) return 'getProjectsByDirectorate';
  if (msg.includes('por responsável') || msg.includes('por dono')) return 'getProjectsByOwner';

  // Painéis
  if (msg.includes('painel') || msg.includes('painéis') || msg.includes('dashboards')) {
    return 'getPanels';
  }

  // Resumo Executivo
  if (msg.includes('resumo') || msg.includes('panorama') || msg.includes('geral') || msg.includes('status do sistema')) {
    return 'getExecutiveSummary';
  }

  // Mudanças Recentes
  if (msg.includes('mudou') || msg.includes('alteração') || msg.includes('hoje') || msg.includes('recente')) {
    return 'getRecentChanges';
  }

  return 'general_query';
}
