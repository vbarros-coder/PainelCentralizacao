/**
 * Permissions
 * Sistema de permissões hierárquico tipo Discord
 */

import { User, UserRole, Project } from '@/types';

// ============================================
// ADMINISTRADORES GLOBAIS (ADM NIE, Luciana, William)
// ============================================

const GLOBAL_ADMINS = [
  'admin@addvalora.com',
  'lhey@addvaloraglobal.com',
  'wfernandez@addvaloraglobal.com',
];

/**
 * Verifica se o usuário é administrador global
 */
export function isGlobalAdmin(user: User | null): boolean {
  if (!user) return false;
  return (
    GLOBAL_ADMINS.includes(user.email.toLowerCase()) ||
    user.role === 'adm-nie' ||
    user.role === 'executivo-luciana' ||
    user.role === 'executivo-william'
  );
}

/**
 * Verifica se o usuário pode gerenciar outros usuários
 */
export function canManageUsers(user: User | null): boolean {
  return isGlobalAdmin(user);
}

/**
 * Verifica se o usuário pode acessar o painel administrativo
 */
export function canAccessAdminPanel(user: User | null): boolean {
  return isGlobalAdmin(user);
}

// ============================================
// ACESSO POR DIRETORIA
// ============================================

/**
 * Verifica se o usuário pode acessar uma diretoria específica
 */
export function canAccessDirectorate(user: User | null, directorate: string): boolean {
  if (!user) return false;
  if (isGlobalAdmin(user)) return true;
  
  // Diretoria principal do usuário
  if (user.diretoria === directorate) return true;
  
  // Diretorias adicionais permitidas
  if (user.allowedDirectorates?.includes(directorate)) return true;
  
  return false;
}

/**
 * Verifica se o usuário pode acessar uma coordenação específica
 */
export function canAccessCoordination(user: User | null, coordination: string): boolean {
  if (!user) return false;
  if (isGlobalAdmin(user)) return true;
  
  // Coordenação principal do usuário
  if (user.coordenacao === coordination) return true;
  
  // Coordenações adicionais permitidas
  if (user.allowedCoordinations?.includes(coordination)) return true;
  
  return false;
}

// ============================================
// ACESSO A PROJETOS
// ============================================

/**
 * Verifica se o usuário pode visualizar um projeto
 */
export function canViewProject(user: User | null, project: Project): boolean {
  if (!user) return false;
  if (isGlobalAdmin(user)) return true;
  
  // Acesso por diretoria
  if (canAccessDirectorate(user, project.diretoria)) {
    // Se o projeto tem coordenação, verificar acesso
    if (project.coordenacao) {
      return canAccessCoordination(user, project.coordenacao);
    }
    return true;
  }
  
  // Projeto específico permitido
  if (user.allowedProjects?.includes(project.id)) return true;
  
  // Usuário é responsável pelo projeto
  if (project.responsibleUserId === user.id) return true;
  
  // Usuário está na lista de permitidos do projeto
  if (project.allowedUsers?.includes(user.id)) return true;
  
  return false;
}

/**
 * Filtra projetos baseado nas permissões do usuário
 */
export function filterProjectsByUserAccess(user: User | null, projects: Project[]): Project[] {
  if (!user) return [];
  if (isGlobalAdmin(user)) return projects;
  
  return projects.filter(project => canViewProject(user, project));
}

// ============================================
// ESCOPO DE PERMISSÃO DO USUÁRIO
// ============================================

export interface PermissionScope {
  level: 'global' | 'directorate' | 'coordination' | 'project' | 'none';
  directorates: string[];
  coordinations: string[];
  projects: string[];
}

/**
 * Retorna o escopo de permissão do usuário
 */
export function getUserPermissionScope(user: User | null): PermissionScope {
  if (!user) {
    return { level: 'none', directorates: [], coordinations: [], projects: [] };
  }
  
  if (isGlobalAdmin(user)) {
    return { level: 'global', directorates: [], coordinations: [], projects: [] };
  }
  
  const directorates: string[] = [];
  if (user.diretoria) directorates.push(user.diretoria);
  if (user.allowedDirectorates) directorates.push(...user.allowedDirectorates);
  
  const coordinations: string[] = [];
  if (user.coordenacao) coordinations.push(user.coordenacao);
  if (user.allowedCoordinations) coordinations.push(...user.allowedCoordinations);
  
  const projects: string[] = user.allowedProjects || [];
  
  // Determinar nível
  let level: PermissionScope['level'] = 'none';
  if (user.role === 'diretor') {
    level = 'directorate';
  } else if (user.role === 'coordenacao') {
    level = 'coordination';
  } else if (user.role === 'operacional' || user.role === 'visualizador') {
    level = 'project';
  }
  
  return {
    level,
    directorates: [...new Set(directorates)],
    coordinations: [...new Set(coordinations)],
    projects: [...new Set(projects)],
  };
}

// ============================================
// LABELS DE CARGOS
// ============================================

export const ROLE_LABELS: Record<UserRole, string> = {
  'adm-nie': 'ADM NIE',
  'executivo-luciana': 'Luciana',
  'executivo-william': 'William Fernandez',
  'diretor': 'Diretor',
  'coordenacao': 'Coordenação',
  'operacional': 'Operacional',
  'visualizador': 'Visualizador',
};

export function getRoleLabel(user: User): string {
  // Para administradores globais, mostrar nome específico
  if (user.email === 'admin@addvalora.com') return 'ADM NIE';
  if (user.email === 'lhey@addvaloraglobal.com') return 'Luciana';
  if (user.email === 'wfernandez@addvaloraglobal.com') return 'William Fernandez';
  
  // Para outros, mostrar cargo descritivo ou label do role
  return user.cargo || ROLE_LABELS[user.role] || user.role;
}

// ============================================
// FILTRO DE CONTEXTO PARA IA (ADDVALU)
// ============================================

export interface AIContext {
  projects: Project[];
  summary: {
    totalProjects: number;
    activeProjects: number;
    // ... outros campos
  };
  // ... outros campos do contexto
}

/**
 * Filtra o contexto da IA baseado nas permissões do usuário
 */
export function filterAIContextByUserAccess(user: User | null, context: AIContext): AIContext {
  if (!user || isGlobalAdmin(user)) return context;
  
  const filteredProjects = filterProjectsByUserAccess(user, context.projects);
  
  // Recalcular summary com projetos filtrados
  const activeProjects = filteredProjects.filter(p => p.status === 'ativo');
  
  return {
    ...context,
    projects: filteredProjects,
    summary: {
      ...context.summary,
      totalProjects: filteredProjects.length,
      activeProjects: activeProjects.length,
    },
  };
}
