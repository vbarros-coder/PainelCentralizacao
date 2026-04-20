/**
 * Relatórios Page
 * Página de relatórios
 */

'use client';

import { motion } from 'framer-motion';
import { BarChart3, FileText, Download, TrendingUp, Users, FolderKanban } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { Card, Button } from '@/components/ui';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { useState } from 'react';

function RelatoriosContent() {
  const [downloading, setDownloading] = useState<string | null>(null);

  // Lógica para obter o mês e ano atual dinamicamente
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const formattedMonthYear = currentMonthYear.charAt(0).toUpperCase() + currentMonthYear.slice(1);

  const handleDownload = (name: string) => {
    if (typeof window === 'undefined') return;
    setDownloading(name);
    
    // Simular geração e download de PDF/Excel
    setTimeout(() => {
      const content = `Relatório: ${name}\nGerado em: ${new Date().toLocaleString()}\n\nEste é um arquivo de demonstração da Central NIE.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.toLowerCase().replace(/\s+/g, '_')}_2026.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloading(null);
    }, 1500);
  };

  const stats = {
    total: MOCK_PROJECTS.length,
    ativos: MOCK_PROJECTS.filter(p => p.status === 'ativo').length,
    concluidos: MOCK_PROJECTS.filter(p => p.status === 'concluido').length,
    tecnologia: MOCK_PROJECTS.filter(p => p.categoria === 'tecnologia').length,
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
            Estatísticas e indicadores da Central NIE
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
  return (
    <ProtectedRoute>
      <RelatoriosContent />
    </ProtectedRoute>
  );
}
