import { Project, User } from '@/types';
import { filterAIContextByUserAccess } from '@/features/ai/types';

export function getCompletedProjects(projects: Project[], user: User) {
  const authorized = filterAIContextByUserAccess(projects, user);
  const items = authorized.filter(p => p.status === 'concluido');
  return {
    tool: 'getCompletedProjects',
    count: items.length,
    items: items.map(p => ({
      id: p.id,
      name: p.nome,
      status: p.status,
      directorate: p.diretoria,
      owner: p.responsavel
    }))
  };
}

export function getActiveProjects(projects: Project[], user: User) {
  const authorized = filterAIContextByUserAccess(projects, user);
  const items = authorized.filter(p => p.status === 'ativo');
  return {
    tool: 'getActiveProjects',
    count: items.length,
    items: items.map(p => ({
      id: p.id,
      name: p.nome,
      status: p.status,
      directorate: p.diretoria,
      owner: p.responsavel
    }))
  };
}

export function getPlanningProjects(projects: Project[], user: User) {
  const authorized = filterAIContextByUserAccess(projects, user);
  const items = authorized.filter(p => p.status === 'planejamento');
  return {
    tool: 'getPlanningProjects',
    count: items.length,
    items: items.map(p => ({
      id: p.id,
      name: p.nome,
      status: p.status,
      directorate: p.diretoria,
      owner: p.responsavel
    }))
  };
}

export function getDelayedProjects(projects: Project[], user: User) {
  return {
    tool: 'getDelayedProjects',
    count: 0,
    items: [],
    message: 'Métricas de progresso desativadas.'
  };
}

export function getCriticalProjects(projects: Project[], user: User) {
  const authorized = filterAIContextByUserAccess(projects, user);
  // Considerando críticos apenas como pausados
  const items = authorized.filter(p => p.status === 'pausado');
  return {
    tool: 'getCriticalProjects',
    count: items.length,
    items: items.map(p => ({
      id: p.id,
      name: p.nome,
      status: p.status,
      directorate: p.diretoria,
      owner: p.responsavel
    }))
  };
}

export function getProjectDetails(projects: Project[], user: User, projectId: string) {
  const authorized = filterAIContextByUserAccess(projects, user);
  const project = authorized.find(p => p.id === projectId);
  return {
    tool: 'getProjectDetails',
    found: !!project,
    item: project
  };
}
