import { Project, User } from '@/types';
import { filterAIContextByUserAccess } from '@/features/ai/types';

export function getPanels(projects: Project[], user: User) {
  const authorized = filterAIContextByUserAccess(projects, user);
  const items = authorized.filter(p => p.tipo === 'painel');
  return {
    tool: 'getPanels',
    count: items.length,
    items: items.map(p => ({
      id: p.id,
      name: p.nome,
      status: p.status,
      owner: p.responsavel
    }))
  };
}
