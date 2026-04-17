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

function RelatoriosContent() {
  const stats = {
    total: MOCK_PROJECTS.length,
    ativos: MOCK_PROJECTS.filter(p => p.status === 'ativo').length,
    concluidos: MOCK_PROJECTS.filter(p => p.status === 'concluido').length,
    tecnologia: MOCK_PROJECTS.filter(p => p.categoria === 'tecnologia').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
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
            { label: 'Total de Projetos', value: stats.total, icon: FolderKanban, color: '#00A651' },
            { label: 'Projetos Ativos', value: stats.ativos, icon: TrendingUp, color: '#0055A4' },
            { label: 'Concluídos', value: stats.concluidos, icon: FileText, color: '#F47920' },
            { label: 'Tecnologia', value: stats.tecnologia, icon: BarChart3, color: '#00A651' },
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

          <div className="space-y-4">
            {[
              { name: 'Relatório de Projetos', desc: 'Visão geral de todos os projetos', date: 'Dezembro 2024' },
              { name: 'Relatório de Atividades', desc: 'Atividades realizadas no período', date: 'Novembro 2024' },
              { name: 'Relatório de Performance', desc: 'Indicadores de performance', date: 'Outubro 2024' },
            ].map((rel, index) => (
              <Card key={rel.name} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#00A651]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#00A651]" />
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{rel.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{rel.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{rel.date}</span>
                  
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                    Baixar
                  </Button>
                </div>
              </Card>
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
