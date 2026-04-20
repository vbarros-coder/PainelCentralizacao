/**
 * Projetos Page
 * Lista de projetos disponíveis
 */

'use client';

import { motion } from 'framer-motion';
import { ExternalLink, FolderKanban } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { Card, Badge } from '@/components/ui';
import { MOCK_PROJECTS, CATEGORY_LABELS } from '@/lib/mock-data';
import { categoryColors } from '@/lib/design-system';
import { cn } from '@/lib/utils';

import { useProjects } from '@/features/projects/use-projects';

function ProjetosContent() {
  const { projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A651]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Projetos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Projetos autorizados para seu perfil na Central NIE
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const categoryStyle = categoryColors[project.categoria];
            
            return (
              <motion.a
                key={project.id}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card isHoverable className="h-full p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A651] to-[#0055A4] flex items-center justify-center">
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>
                    <Badge
                      variant="default"
                      className={cn(
                        categoryStyle.bg,
                        categoryStyle.text,
                        categoryStyle.border
                      )}
                    >
                      {CATEGORY_LABELS[project.categoria]}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {project.nome}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {project.descricao}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {project.diretoria}
                    </span>
                    
                    <span className="flex items-center gap-1 text-sm text-[#00A651] font-medium">
                      Acessar
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>
                </Card>
              </motion.a>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Nenhum projeto encontrado</h3>
            <p className="text-sm text-gray-400">Você não tem permissão para acessar nenhum projeto nesta diretoria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjetosPage() {
  return (
    <ProtectedRoute>
      <ProjetosContent />
    </ProtectedRoute>
  );
}
