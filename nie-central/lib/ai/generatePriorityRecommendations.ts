/**
 * Generate Priority Recommendations
 * Define o que merece atenção primeiro
 */

import { Project } from '@/types';

export interface Priority {
  rank: number;
  title: string;
  description: string;
  action: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export function generatePriorityRecommendations(projects: Project[]): Priority[] {
  const priorities: Priority[] = [];
  let rank = 1;

  // 1. Projetos em planejamento há muito tempo
  const planejamentoExcessivo = projects.filter(
    (p) => p.status === 'planejamento'
  );
  if (planejamentoExcessivo.length > 3) {
    priorities.push({
      rank: rank++,
      title: 'Acelerar iniciação de projetos',
      description: `${planejamentoExcessivo.length} projetos aguardando iniciação há tempo`,
      action: 'Revisar backlog e priorizar iniciações',
      severity: 'high',
    });
  }

  // 2. Projetos pausados que precisam de atenção
  const pausados = projects.filter((p) => p.status === 'pausado');
  if (pausados.length > 0) {
    priorities.push({
      rank: rank++,
      title: 'Retomar projetos pausados',
      description: `${pausados.length} projeto(s) pausado(s) aguardando retomada`,
      action: 'Avaliar viabilidade de retomada ou cancelamento',
      severity: 'medium',
    });
  }

  // 4. Diretoria com maior carga
  const byDirectorate: Record<
    string,
    { total: number; ativos: number; concluidos: number }
  > = {};

  for (const p of projects) {
    const key = p.diretoria || 'Sem diretoria';
    if (!byDirectorate[key]) {
      byDirectorate[key] = { total: 0, ativos: 0, concluidos: 0 };
    }
    byDirectorate[key].total += 1;
    if (p.status === 'ativo') {
      byDirectorate[key].ativos += 1;
    } else if (p.status === 'concluido') {
      byDirectorate[key].concluidos += 1;
    }
  }

  const diretoriaMaisPressionada = Object.entries(byDirectorate).sort(
    (a, b) => b[1].ativos - a[1].ativos
  )[0];

  if (diretoriaMaisPressionada && diretoriaMaisPressionada[1].ativos > 5) {
    priorities.push({
      rank: rank++,
      title: 'Equilibrar carga da diretoria',
      description: `${diretoriaMaisPressionada[0]} concentra ${diretoriaMaisPressionada[1].ativos} projetos ativos`,
      action: 'Redistribuir projetos ou reforçar equipe',
      severity: 'high',
    });
  }

  return priorities;
}

/**
 * Gera recomendações específicas por diretoria
 */
export function generateDirectorateRecommendations(
  projects: Project[],
  directorate: string
): Priority[] {
  const dirProjects = projects.filter((p) => p.diretoria === directorate);
  const priorities: Priority[] = [];

  const ativos = dirProjects.filter((p) => p.status === 'ativo');
  const pausados = dirProjects.filter((p) => p.status === 'pausado');

  if (ativos.length > 5) {
    priorities.push({
      rank: 1,
      title: 'Gerenciar carga de trabalho',
      description: `${ativos.length} projetos ativos na diretoria`,
      action: 'Priorizar entregas e avaliar capacidade',
      severity: 'high',
    });
  }

  if (pausados.length > 0) {
    priorities.push({
      rank: 2,
      title: 'Retomar projetos pausados',
      description: `${pausados.length} projeto(s) aguardando retomada`,
      action: 'Definir plano de ação para retomada',
      severity: 'medium',
    });
  }

  return priorities;
}
