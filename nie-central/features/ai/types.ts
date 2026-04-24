import { Project, ProjectStatus, User } from '@/types';

// ============================================
// DATA LAYER (Dados Vivos)
// ============================================

export interface OperationalSnapshot {
  timestamp: string;
  projects: Project[];
  users: User[];
  summary: {
    total: number;
    active: number;
    completed: number;
    delayed: number;
    critical: number;
    byDirectorate: Record<string, number>;
    byOwner: Record<string, number>;
  };
}

import { isGlobalAdmin } from '@/lib/permissions';

// ============================================
// PERMISSION LAYER
// ============================================

export function filterAIContextByUserAccess(data: Project[], user: User): Project[] {
  // Global Admins (ADM NIE, Luciana, WF)
  if (isGlobalAdmin(user)) {
    return data;
  }

  return data.filter(p => {
    // 1. Acesso por Diretoria
    if (user.diretoria && p.diretoria === user.diretoria) return true;
    
    // 2. Acesso por Coordenação
    if (user.coordenacao && p.coordenacao === user.coordenacao) return true;

    // 3. Acesso por Lista Explícita de Projetos
    if (user.allowedProjects?.includes(p.id)) return true;

    // 4. Acesso por Lista Explícita de Painéis (se for painel)
    if (p.tipo === 'painel' && user.allowedPanels?.includes(p.id)) return true;

    // 5. Responsável pelo projeto
    if (p.responsavel === user.name) return true;

    return false;
  });
}

// ============================================
// INTELLIGENCE LAYER (Lógica em Código)
// ============================================

export function buildExecutiveSummary(projects: Project[]) {
  const active = projects.filter(p => p.status === 'ativo');
  const delayed = active.filter(p => (p.progresso || 0) < 50); // Simplificação para exemplo
  
  return {
    total: projects.length,
    active: active.length,
    completed: projects.filter(p => p.status === 'concluido').length,
    delayed: delayed.length,
    avgProgress: Math.round(active.reduce((acc, p) => acc + (p.progresso || 0), 0) / (active.length || 1))
  };
}

export function generateOperationalInsights(projects: Project[]) {
  const insights: string[] = [];
  const byDirectorate = groupProjectsByDirectorate(projects);
  
  Object.entries(byDirectorate).forEach(([dir, projs]) => {
    if (projs.length > 8) {
      insights.push(`Alta concentração de carga na diretoria ${dir} (${projs.length} projetos)`);
    }
  });

  return insights;
}

export function groupProjectsByDirectorate(projects: Project[]): Record<string, Project[]> {
  return projects.reduce((acc, p) => {
    acc[p.diretoria] = acc[p.diretoria] || [];
    acc[p.diretoria].push(p);
    return acc;
  }, {} as Record<string, Project[]>);
}

// ============================================
// MEMORY LAYER (Conversa e Eventos)
// ============================================

export interface ConversationMemory {
  lastQuestion?: string;
  lastIntent?: string;
  lastFilters?: any;
  lastProjectSet?: string[]; // IDs
  contextStack: string[]; // Histórico de tópicos
}

export interface OperationalEvent {
  eventId: string;
  eventType: 'create' | 'update' | 'delete' | 'status_change' | 'progress_change';
  entityType: 'project' | 'user' | 'panel';
  entityId: string;
  before?: any;
  after?: any;
  changedBy: string;
  createdAt: string;
  severity: 'low' | 'medium' | 'high';
}

// ============================================
// ORCHESTRATOR TYPES
// ============================================

export interface AddvaluContext {
  question: string;
  intent: string;
  summary: any;
  projects: Project[];
  insights: string[];
  alerts: string[];
  memory: ConversationMemory;
  events: OperationalEvent[];
}
