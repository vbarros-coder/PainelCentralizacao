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

function RelatoriosContent() {
  const { user, isGlobalAdmin, logAction } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);

  // Lógica para obter o mês e ano atual dinamicamente
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const formattedMonthYear = currentMonthYear.charAt(0).toUpperCase() + currentMonthYear.slice(1);

  // Automação: Filtrar estatísticas por diretoria (se não for ADM NIE)
  const stats = useMemo(() => {
    const projects = MOCK_PROJECTS.filter(p => 
      isGlobalAdmin() || user?.profile === 'executivo' || p.diretoria === user?.diretoria
    );

    return {
      total: projects.length,
      ativos: projects.filter(p => p.status === 'ativo').length,
      concluidos: projects.filter(p => p.status === 'concluido').length,
      tecnologia: projects.filter(p => p.categoria === 'tecnologia').length,
      diretoria: user?.diretoria || 'Geral'
    };
  }, [user, isGlobalAdmin]);

  const handleDownload = (name: string) => {
    if (typeof window === 'undefined') return;
    setDownloading(name);
    
    // Simular geração e download de PDF/Excel
    setTimeout(() => {
      const content = `Relatório: ${name}\nEscopo: ${stats.diretoria}\nGerado em: ${new Date().toLocaleString()}\n\nEste é um arquivo de demonstração da Central NIE.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.toLowerCase().replace(/\s+/g, '_')}_${stats.diretoria.toLowerCase().replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloading(null);

      // Automação: Registrar geração de relatório nos logs
      logAction(`Relatório Gerado: ${name}`, 'ADMIN', `Escopo: ${stats.diretoria}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Relatórios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Estatísticas e indicadores da Central NIE - {stats.diretoria}
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
                    <p 
                      className="text-3xl font-bold mt-1"
                      style={{ color: stat.color }}
                    >
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Relatórios Disponíveis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Relatório de Projetos', desc: 'Visão geral de todos os projetos', date: formattedMonthYear },
              { name: 'Relatório de Atividades', desc: 'Atividades realizadas no período', date: formattedMonthYear },
              { name: 'Relatório de Performance', desc: 'Indicadores de performance', date: formattedMonthYear },
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

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {rel.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-1">
                    {rel.desc}
                  </p>

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
