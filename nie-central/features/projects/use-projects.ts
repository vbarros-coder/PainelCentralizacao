/**
 * Projects Hook
 * Hook para acessar o contexto global de projetos
 */

'use client';

import { useProjectsContext } from './projects-context';

export function useProjects() {
  const context = useProjectsContext();
  
  return {
    ...context,
    // Alias para manter compatibilidade com componentes que esperam toggleUserDestaque
    toggleUserDestaque: context.toggleHighlight,
  };
}
