/**
 * Relatórios Page
 * Página de relatórios
 */

'use client';

import { motion } from 'framer-motion';
import { BarChart3, FileText, Download, TrendingUp, Users, FolderKanban } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { useAuth } from '@/features/auth/auth-context';
import { Card, Button } from '@/components/ui';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { useState, useMemo } from 'react';

// Utilitário: gera e baixa um arquivo
function downloadFile(filename: string, content: string, mime = 'text/csv;charset=utf-8;') {
  const BOM = '\uFEFF'; // BOM para UTF-8 — garante acentos no Excel
  const blob = new Blob([BOM + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function escapeCsv(val: unknown): string {
  const str = String(val ?? '');
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

function rowsToCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map(r => r.map(escapeCsv).join(',')).join('\n');
}

function RelatoriosContent() {
  const { user, isGlobalAdmin, logAction } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);

  const currentDate = new Date();
  const formattedMonthYear = currentDate
    .toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());

  const slug = (s: string) =>
    s.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  // Filtrar apenas projetos reais (tipo === 'projeto') por diretoria/permissão
  const projects = useMemo(() => {
    return MOCK_PROJECTS.filter(p => {
      const isProject = (p as any).tipo === 'projeto' || !(p as any).tipo;
      const hasAccess =
        isGlobalAdmin() ||
        (user as any)?.profile === 'executivo' ||
        p.diretoria === user?.diretoria;
      return isProject && hasAccess;
    });
  }, [user, isGlobalAdmin]);

  const stats = useMemo(() => ({
    total: projects.length,
    ativos: projects.filter(p => p.status === 'ativo').length,
    concluidos: projects.filter(p => p.status === 'concluido').length,
    tecnologia: projects.filter(p => p.categoria === 'tecnologia').length,
    diretoria: user?.diretoria || 'Geral',
  }), [projects, user]);

  // ── Geração dos relatórios ──────────────────────────────────────────────────

  function gerarRelatorioProjectos() {
    const ativos = projects.filter(p => p.status === 'ativo');
    const headers = ['ID', 'Nome', 'Status', 'Categoria', 'Diretoria', 'Responsavel', 'Data Inicio'];
    const rows = ativos.map(p => [
      p.id,
      p.nome,
      p.status,
      p.categoria || '',
      p.diretoria || '',
      p.responsavel || '',
      (p as any).dataInicio || '',
    ]);
    const csv = rowsToCsv(headers, rows);
    downloadFile(`relatorio_projetos_ativos_${slug(formattedMonthYear)}.csv`, csv);
  }

  function gerarRelatorioAtividades() {
    // "Atividades" = histórico de acessos disponível via logAction (simulado aqui com dados reais)
    const headers = ['Diretoria', 'Total Projetos', 'Ativos', 'Concluidos', 'Planejamento', 'Em Pausa'];
    // Agrupa projetos por diretoria
    const byDir = projects.reduce<Record<string, typeof projects>>((acc, p) => {
      const d = p.diretoria || 'Sem Diretoria';
      if (!acc[d]) acc[d] = [];
      acc[d].push(p);
      return acc;
    }, {});
    const rows = Object.entries(byDir).map(([dir, list]) => [
      dir,
      String(list.length),
      String(list.filter(p => p.status === 'ativo').length),
      String(list.filter(p => p.status === 'concluido').length),
      String(list.filter(p => p.status === 'planejamento').length),
      String(list.filter(p => p.status === 'pausado').length),
    ]);
    const csv = rowsToCsv(headers, rows);
    downloadFile(`relatorio_atividades_${slug(formattedMonthYear)}.csv`, csv);
  }

  function gerarRelatorioPerformance() {
    const headers = [
      'Indicador', 'Valor', 'Percentual',
    ];
    const total = projects.length || 1;
    const rows = [
      ['Total de Projetos', String(projects.length), '100%'],
      ['Projetos Ativos', String(stats.ativos), `${Math.round((stats.ativos / total) * 100)}%`],
      ['Projetos Concluídos', String(stats.concluidos), `${Math.round((stats.concluidos / total) * 100)}%`],
      ['Projetos em Planejamento',
        String(projects.filter(p => p.status === 'planejamento').length),
        `${Math.round((projects.filter(p => p.status === 'planejamento').length / total) * 100)}%`],
      ['Projetos Pausados',
        String(projects.filter(p => p.status === 'pausado').length),
        `${Math.round((projects.filter(p => p.status === 'pausado').length / total) * 100)}%`],
      ['Categoria Tecnologia', String(stats.tecnologia), `${Math.round((stats.tecnologia / total) * 100)}%`],
      ['Categoria Operacional',
        String(projects.filter(p => p.categoria === 'operacional').length),
        `${Math.round((projects.filter(p => p.categoria === 'operacional').length / total) * 100)}%`],
      ['Escopo', stats.diretoria, ''],
      ['Gerado em', new Date().toLocaleString('pt-BR'), ''],
    ];
    const csv = rowsToCsv(headers, rows);
    downloadFile(`relatorio_performance_${slug(formattedMonthYear)}.csv`, csv);
  }

  const handleDownload = (name: string) => {
    if (typeof window === 'undefined') return;
    setDownloading(name);
    setTimeout(() => {
      if (name === 'Relatório de Projetos') gerarRelatorioProjectos();
      else if (name === 'Relatório de Atividades') gerarRelatorioAtividades();
      else if (name === 'Relatório de Performance') gerarRelatorioPerformance();
      setDownloading(null);
      logAction(`Relatório Gerado: ${name}`, 'ADMIN', `Escopo: ${stats.diretoria}`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Relatórios</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Estatísticas e indicadores da Central NIE — {stats.diretoria}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total de Projetos', value: stats.total, icon: FolderKanban, color: '#0055A4' },
            { label: 'Projetos Ativos', value: stats.ativos, icon: TrendingUp, color: '#00A651' },
            { label: 'Concluídos', value: stats.concluidos, icon: FileText, color: '#F47920' },
            { label: 'Tecnologia', value: stats.tecnologia, icon: BarChart3, color: '#0055A4' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Relatórios Disponíveis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Relatórios Disponíveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Relatório de Projetos',
                desc: `Todos os ${stats.ativos} projetos ativos — dados completos em CSV`,
                date: formattedMonthYear,
              },
              {
                name: 'Relatório de Atividades',
                desc: 'Distribuição de projetos por diretoria e status',
                date: formattedMonthYear,
              },
              {
                name: 'Relatório de Performance',
                desc: 'Indicadores percentuais de performance por categoria e status',
                date: formattedMonthYear,
              },
            ].map((rel, index) => (
              <motion.div
                key={rel.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="p-6 h-full flex flex-col relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0055A4]/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#0055A4]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{rel.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-1">{rel.desc}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-sm font-medium text-gray-400">{rel.date}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Download className="w-4 h-4" />}
                      isLoading={downloading === rel.name}
                      onClick={() => handleDownload(rel.name)}
                    >
                      Baixar
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function RelatoriosPage() {
  const { canAccessReports } = useAuth();
  return (
    <ProtectedRoute>
      {canAccessReports() ? (
        <RelatoriosContent />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="p-8 max-w-md text-center">
            <BarChart3 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Acesso Restrito</h2>
            <p className="text-gray-500">Seu perfil não possui permissão para visualizar relatórios administrativos.</p>
          </Card>
        </div>
      )}
    </ProtectedRoute>
  );
}
