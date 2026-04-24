/**
 * Generate Operational Insights
 * Detecta sinais importantes nos dados antes da chamada da IA
 */

import { Project } from '@/types';

export interface Insight {
  type: 'risk' | 'attention' | 'info';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export function generateOperationalInsights(projects: Project[]): Insight[] {
  const insights: Insight[] = [];

  // 1. Projetos em planejamento excessivo
  const emPlanejamento = projects.filter((p) => p.status === 'planejamento');
  if (emPlanejamento.length > 5) {
    insights.push({
      type: 'attention',
      message: `${emPlanejamento.length} projetos ainda em planejamento - possível gargalo de iniciação`,
      severity: 'medium',
    });
  }

  // 2. Projetos pausados
  const pausados = projects.filter((p) => p.status === 'pausado');
  if (pausados.length > 0) {
    insights.push({
      type: 'risk',
      message: `${pausados.length} projeto(s) pausado(s) que podem precisar de atenção para retomada`,
      severity: 'medium',
    });
  }

  // 4. Análise por diretoria - concentração
  const diretorias = [...new Set(projects.map((p) => p.diretoria))];
  const diretoriaComMaisAtivos = diretorias
    .map((d) => ({
      nome: d,
      count: projects.filter((p) => p.diretoria === d && p.status === 'ativo').length,
    }))
    .sort((a, b) => b.count - a.count)[0];

  if (diretoriaComMaisAtivos && diretoriaComMaisAtivos.count > 8) {
    insights.push({
      type: 'risk',
      message: `Diretoria ${diretoriaComMaisAtivos.nome} concentra ${diretoriaComMaisAtivos.count} projetos ativos - avaliar capacidade de entrega`,
      severity: 'high',
    });
  }

  // 5. Projetos concluídos recentemente (positivo)
  const concluidos = projects.filter((p) => p.status === 'concluido');
  if (concluidos.length > 5) {
    insights.push({
      type: 'info',
      message: `${concluidos.length} projetos já concluídos - operação com entregas consistentes`,
      severity: 'low',
    });
  }

  return insights;
}

/**
 * Gera alertas específicos para ações imediatas
 */
export function generateAlerts(projects: Project[]): string[] {
  const alerts: string[] = [];

  // Alerta de concentração crítica
  const byDirectorate: Record<string, number> = {};
  for (const p of projects.filter((p) => p.status === 'ativo')) {
    const dir = p.diretoria || 'Sem diretoria';
    byDirectorate[dir] = (byDirectorate[dir] || 0) + 1;
  }

  const entries = Object.entries(byDirectorate).sort((a, b) => b[1] - a[1]);
  if (entries[0] && entries[0][1] > 10) {
    alerts.push(`Concentração crítica: ${entries[0][0]} tem ${entries[0][1]} projetos ativos`);
  }

  // Alerta de projetos sem link
  const semLink = projects.filter((p) => !p.link || p.link === '#');
  if (semLink.length > 5) {
    alerts.push(`${semLink.length} projetos sem link de acesso configurado`);
  }

  return alerts;
}
