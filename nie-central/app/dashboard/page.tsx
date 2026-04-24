/**
 * Dashboard Page
 * Página principal com grid de projetos
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { HeroSection } from '@/features/projects/hero-section';
import { ProjectCard } from '@/features/projects/project-card';
import { ProjectFiltersComponent } from '@/features/projects/project-filters';
import { ComingSoonModal } from '@/features/projects/coming-soon-modal';
import { useProjects } from '@/features/projects/use-projects';
import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';
import { Project } from '@/types';

function DashboardContent() {
  const { user } = useAuth();
  const {
    filteredProjects,
    featuredProjects,
    filters,
    setFilters,
    sort,
    setSort,
    isLoading,
    stats,
  } = useProjects();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const handleAccess = (project: Project) => {
    if (project.link === '#') {
      setSelectedProject(project);
      setIsComingSoonOpen(true);
    }
  };

  // Separar Painéis de Projetos usando o campo tipo
  const painelProjects = filteredProjects.filter(p => p.tipo === 'painel');
  const featuredPainels = featuredProjects.filter(p => p.tipo === 'painel');

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Olá, <span className="text-[#0055A4]">{user?.name}</span>!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Bem-vindo ao Painel NIE.
          </p>
        </motion.div>
      </div>

      <HeroSection />

      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Filters */}
          <ProjectFiltersComponent
            filters={filters}
            sort={sort}
            onFilterChange={setFilters}
            onSortChange={setSort}
            resultCount={painelProjects.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Featured Painels Section */}
          {!filters.search && !filters.apenasFavoritos && featuredPainels.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Painéis em Destaque
                </h2>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                  {featuredPainels.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {featuredPainels.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onAccess={handleAccess}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Painéis Section */}
          {painelProjects.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Todos os Painéis
                </h2>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/30 text-[#0055A4] dark:text-blue-300 text-xs rounded-full">
                  {painelProjects.length}
                </span>
              </div>

              <div className={cn(
                'grid gap-6',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              )}>
                <AnimatePresence mode="popLayout">
                  {painelProjects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onAccess={handleAccess}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

            <ComingSoonModal
            isOpen={isComingSoonOpen}
            onClose={() => setIsComingSoonOpen(false)}
            project={selectedProject}
          />

          {/* Empty State */}
          {!isLoading && painelProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                  <FolderOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhum projeto encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  {filters.search
                    ? `Não encontramos projetos correspondentes a "${filters.search}".`
                    : filters.apenasFavoritos
                    ? 'Você ainda não favoritou nenhum projeto.'
                    : 'Não há projetos disponíveis com os filtros selecionados.'}
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      search: '',
                      categoria: 'all',
                      status: 'all',
                      diretoria: 'all',
                      apenasFavoritos: false,
                      apenasDestaque: false,
                    })
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Limpar filtros
                </button>
              </motion.div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
