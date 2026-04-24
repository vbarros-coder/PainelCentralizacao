/**
 * Build Executive Context
 * Monta o contexto estruturado para a IA
 */

import { Project, User, UserPresenceStatus } from '@/types';
import { ConversationMemory } from './conversationMemory';
import { generateOperationalInsights, generateAlerts } from './generateOperationalInsights';
import { generatePriorityRecommendations } from './generatePriorityRecommendations';

export interface ExecutiveContext {
  question: string;
  intent: string;
  responseMode: 'executive' | 'operational';
  dateReference: string;
  summary: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    planningProjects: number;
    pausedProjects: number;
    featuredProjects: number;
  };
  projects: Project[];
  criticalProjects: Project[];
  featuredProjectsList: Project[];
  byDirectorate: DirectorateSummary[];
  byOwner: OwnerSummary[];
  insights: string[];
  alerts: string[];
  priorities: string[];
  conversationMemory: ConversationMemory;
}

interface DirectorateSummary {
  name: string;
  total: number;
  active: number;
  completed: number;
  paused: number;
  planning: number;
}

interface OwnerSummary {
  name: string;
  total: number;
  active: number;
  projects: string[];
}

interface BuildContextParams {
  question: string;
  intent: string;
  responseMode: 'executive' | 'operational';
  projects: Project[];
  users?: User[];
  memory?: ConversationMemory;
}

export function buildExecutiveContext({
  question,
  intent,
  responseMode,
  projects,
  users = [],
  memory,
}: BuildContextParams): ExecutiveContext {
  const now = new Date();

  // Resumo geral
  const activeProjects = projects.filter((p) => p.status === 'ativo');
  const completedProjects = projects.filter((p) => p.status === 'concluido');
  const planningProjects = projects.filter((p) => p.status === 'planejamento');
  const pausedProjects = projects.filter((p) => p.status === 'pausado');
  const featuredProjectsList = projects.filter((p) => p.destaque);

  // Agrupar por diretoria
  const byDirectorateMap = new Map<string, DirectorateSummary>();
  for (const p of projects) {
    const dir = p.diretoria || 'Sem diretoria';
    if (!byDirectorateMap.has(dir)) {
      byDirectorateMap.set(dir, {
        name: dir,
        total: 0,
        active: 0,
        completed: 0,
        paused: 0,
        planning: 0,
      });
    }
    const summary = byDirectorateMap.get(dir)!;
    summary.total++;
    if (p.status === 'ativo') summary.active++;
    if (p.status === 'concluido') summary.completed++;
    if (p.status === 'pausado') summary.paused++;
    if (p.status === 'planejamento') summary.planning++;
  }

  const byDirectorate = Array.from(byDirectorateMap.values()).sort(
    (a, b) => b.active - a.active
  );

  // Agrupar por responsável
  const byOwnerMap = new Map<string, OwnerSummary>();
  for (const p of projects.filter((p) => p.status === 'ativo')) {
    const owner = p.responsavel || 'Não definido';
    if (!byOwnerMap.has(owner)) {
      byOwnerMap.set(owner, {
        name: owner,
        total: 0,
        active: 0,
        projects: [],
      });
    }
    const summary = byOwnerMap.get(owner)!;
    summary.total++;
    summary.active++;
    summary.projects.push(p.nome);
  }

  const byOwner = Array.from(byOwnerMap.values())
    .sort((a, b) => b.active - a.active)
    .slice(0, 10);

  // Projetos críticos (em destaque ou pausados)
  const criticalProjects = projects
    .filter(
      (p) =>
        p.destaque ||
        p.status === 'pausado'
    )
    .slice(0, 10);

  // Gerar insights
  const insights = generateOperationalInsights(projects);
  const alerts = generateAlerts(projects);
  const priorities = generatePriorityRecommendations(projects);

  return {
    question,
    intent,
    responseMode,
    dateReference: now.toISOString(),
    summary: {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      planningProjects: planningProjects.length,
      pausedProjects: pausedProjects.length,
      featuredProjects: featuredProjectsList.length,
    },
    projects: responseMode === 'operational' ? projects.slice(0, 20) : projects.slice(0, 10),
    criticalProjects,
    featuredProjectsList: featuredProjectsList.slice(0, 5),
    byDirectorate: responseMode === 'executive' ? byDirectorate.slice(0, 5) : byDirectorate,
    byOwner: responseMode === 'executive' ? byOwner.slice(0, 5) : byOwner,
    insights: insights.map((i) => i.message),
    alerts,
    priorities: priorities.slice(0, 5).map((p) => `${p.rank}. ${p.title}: ${p.description}`),
    conversationMemory: memory || {
      lastTopic: null,
      lastDirectorate: null,
      lastIntent: null,
      lastQuestion: null,
      lastResponseType: null,
      contextStack: [],
    },
  };
}

/**
 * Formata o contexto para envio à IA
 */
export function formatContextForAI(context: ExecutiveContext): string {
  const sections: string[] = [];

  // Resumo executivo
  sections.push(`RESUMO EXECUTIVO:`);
  sections.push(`- Total de projetos: ${context.summary.totalProjects}`);
  sections.push(`- Ativos: ${context.summary.activeProjects}`);
  sections.push(`- Concluídos: ${context.summary.completedProjects}`);
  sections.push(`- Em planejamento: ${context.summary.planningProjects}`);
  sections.push(`- Pausados: ${context.summary.pausedProjects}`);
  sections.push('');

  // Insights
  if (context.insights.length > 0) {
    sections.push(`INSIGHTS OPERACIONAIS:`);
    context.insights.forEach((insight) => {
      sections.push(`- ${insight}`);
    });
    sections.push('');
  }

  // Alertas
  if (context.alerts.length > 0) {
    sections.push(`ALERTAS:`);
    context.alerts.forEach((alert) => {
      sections.push(`⚠️ ${alert}`);
    });
    sections.push('');
  }

  // Prioridades
  if (context.priorities.length > 0) {
    sections.push(`PRIORIDADES SUGERIDAS:`);
    context.priorities.forEach((priority) => {
      sections.push(`- ${priority}`);
    });
    sections.push('');
  }

  // Projetos em destaque
  if (context.featuredProjectsList.length > 0) {
    sections.push(`PROJETOS EM DESTAQUE:`);
    context.featuredProjectsList.forEach((p) => {
      sections.push(`- ${p.nome} (${p.diretoria})`);
    });
    sections.push('');
  }

  // Por diretoria
  if (context.responseMode === 'executive' && context.byDirectorate.length > 0) {
    sections.push(`DISTRIBUIÇÃO POR DIRETORIA:`);
    context.byDirectorate.forEach((d) => {
      sections.push(`- ${d.name}: ${d.active} ativos, ${d.completed} concluídos`);
    });
    sections.push('');
  }

  // Memória da conversa
  if (context.conversationMemory.lastDirectorate) {
    sections.push(`CONTEXTO ANTERIOR: Diretoria ${context.conversationMemory.lastDirectorate}`);
    sections.push('');
  }

  return sections.join('\n');
}
