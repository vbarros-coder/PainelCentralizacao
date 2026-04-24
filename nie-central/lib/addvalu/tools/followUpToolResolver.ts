import { ConversationMemory } from '@/features/ai/types';

export function resolveFollowUp(question: string, memory: ConversationMemory): string | null {
  const msg = question.toLowerCase();
  
  if (!memory.lastIntent) return null;

  // Se a intenção anterior era listar projetos e o usuário pede agrupamento
  const projectIntents = [
    'getCompletedProjects', 
    'getActiveProjects', 
    'getPlanningProjects', 
    'getDelayedProjects', 
    'getCriticalProjects',
    'list_projects'
  ];

  if (projectIntents.includes(memory.lastIntent)) {
    if (msg.includes('por diretoria') || msg.includes('separar por diretoria')) {
      return 'getProjectsByDirectorate';
    }
    if (msg.includes('por responsável') || msg.includes('por dono') || msg.includes('quem são')) {
      return 'getProjectsByOwner';
    }
  }

  return null;
}
