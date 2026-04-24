import { Project } from '@/types';

export function getExecutiveSummary(projects: Project[]) {
  const active = projects.filter(p => p.status === 'ativo');
  const completed = projects.filter(p => p.status === 'concluido');
  const planning = projects.filter(p => p.status === 'planejamento');

  return {
    tool: 'getExecutiveSummary',
    total: projects.length,
    active: active.length,
    completed: completed.length,
    planning: planning.length
  };
}

export function groupProjectsByDirectorate(projects: Project[]) {
  const groups: Record<string, any[]> = {};
  
  projects.forEach(p => {
    const dir = p.diretoria || 'Sem Diretoria';
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push({
      name: p.nome,
      status: p.status
    });
  });

  return {
    tool: 'getProjectsByDirectorate',
    directorates: Object.keys(groups),
    groups
  };
}

export function groupProjectsByOwner(projects: Project[]) {
  const groups: Record<string, any[]> = {};
  
  projects.forEach(p => {
    const owner = p.responsavel || 'Sem Responsável';
    if (!groups[owner]) groups[owner] = [];
    groups[owner].push({
      name: p.nome,
      status: p.status
    });
  });

  return {
    tool: 'getProjectsByOwner',
    owners: Object.keys(groups),
    groups
  };
}
