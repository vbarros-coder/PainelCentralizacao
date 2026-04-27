/**
 * Projetos Page
 * Lista de projetos disponíveis
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderKanban, 
} from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { ProjectCard } from '@/features/projects/project-card';
import { ProjectFiltersComponent } from '@/features/projects/project-filters';
import { ComingSoonModal } from '@/features/projects/coming-soon-modal';
import { Project } from '@/types';
import { useState } from 'react';
import { useProjects } from '@/features/projects/use-projects';
import { cn } from '@/lib/utils';

function ProjetosContent() {
  const { filteredProjects, isLoading, filters, setFilters, sort, setSort } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleAccess = (project: Project) => {
    if (project.link === '#') {
      setSelectedProject(project);
      setIsComingSoonOpen(true);
    }
  };

  // Filtrar apenas projetos (tipo === 'projeto') de filteredProjects
  const onlyProjects = filteredProjects.filter(p => p.tipo === 'projeto');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0055A4]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Projetos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Lista completa de projetos da Central NIE
              </p>
            </div>
          </div>

          {/* Barra de Busca e Filtros */}
          <ProjectFiltersComponent
            filters={filters}
            sort={sort}
            onFilterChange={setFilters}
            onSortChange={setSort}
            resultCount={onlyProjects.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </motion.div>

        {/* Grid de Projetos */}
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          <AnimatePresence mode="popLayout">
            {onlyProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                onAccess={handleAccess}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        <ComingSoonModal
          isOpen={isComingSoonOpen}
          onClose={() => setIsComingSoonOpen(false)}
          project={selectedProject}
        />

        {onlyProjects.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Nenhum projeto encontrado</h3>
            <p className="text-sm text-gray-400">Tente ajustar seus filtros ou busca.</p>
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
