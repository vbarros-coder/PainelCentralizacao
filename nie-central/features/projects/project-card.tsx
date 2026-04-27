/**
 * Project Card Component
 * Card de projeto/painel com identidade visual Addvalora
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star,
  ArrowUpRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { cn, truncateText } from '@/lib/utils';
import { Badge, Card, Button } from '@/components/ui';
import { Project } from '@/types';
import { categoryColors, statusColors } from '@/lib/design-system';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/mock-data';

import { useProjects } from '@/features/projects/use-projects';

interface ProjectCardProps {
  project: Project;
  onAccess?: (project: Project) => void;
  index?: number;
}

export function ProjectCard({ 
  project, 
  onAccess,
  index = 0 
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleFavorite, toggleHighlight } = useProjects();

  const categoryStyle = categoryColors[project.categoria];
  const statusStyle = statusColors[project.status];
  const hasLink = project.link && project.link !== '#';

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(project.id);
  };

  const handleHighlight = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleHighlight(project.id);
  };

  const handleAccess = (e: React.MouseEvent) => {
    if (!hasLink && onAccess) {
      e.preventDefault();
      e.stopPropagation();
      onAccess(project);
    }
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (hasLink) {
      return (
        <Link href={project.link} target="_blank" rel="noopener noreferrer" className="block h-full">
          {children}
        </Link>
      );
    }
    return (
      <div onClick={handleAccess} className="cursor-pointer h-full">
        {children}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      layout
      className="h-full"
    >
      <CardWrapper>
        <Card
          isHoverable
          className={cn(
            'relative overflow-hidden group',
            'h-full flex flex-col',
            project.destaque && 'ring-2 ring-[#0055A4]/50 dark:ring-[#0055A4]/30'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header Actions - Favorito e Destaque */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            <button
              onClick={handleFavorite}
              title="Favorito"
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                project.favorito 
                  ? "bg-amber-100 text-amber-500 shadow-sm" 
                  : "bg-white/80 dark:bg-black/20 text-gray-400 hover:bg-white dark:hover:bg-black/40 hover:text-amber-500 shadow-sm"
              )}
            >
              <Star className={cn("w-4 h-4", project.favorito && "fill-current")} />
            </button>

            <button
              onClick={handleHighlight}
              title="Destaque"
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                project.destaque 
                  ? "bg-[#0055A4]/10 text-[#0055A4] shadow-sm ring-1 ring-[#0055A4]/20" 
                  : "bg-white/80 dark:bg-black/20 text-gray-400 hover:bg-white dark:hover:bg-black/40 hover:text-[#0055A4] shadow-sm"
              )}
            >
              <Sparkles className={cn("w-4 h-4", project.destaque && "fill-current")} />
            </button>

            {!hasLink && project.status !== 'ativo' && project.status !== 'concluido' && (
              <Badge 
                variant="default" 
                size="sm" 
                className="shadow-sm flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200"
              >
                <Lock className="w-3 h-3" />
                Em breve
              </Badge>
            )}
          </div>

          {/* Header */}
          <div className="p-5 flex-1">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="default"
                  className={cn(
                    categoryStyle.bg,
                    categoryStyle.text,
                    categoryStyle.border,
                    categoryStyle.dark.bg,
                    categoryStyle.dark.text,
                    categoryStyle.dark.border
                  )}
                >
                  {CATEGORY_LABELS[project.categoria]}
                </Badge>
                <Badge
                  variant="default"
                  className={cn(
                    statusStyle.bg,
                    statusStyle.text,
                    statusStyle.border,
                    statusStyle.dark.bg,
                    statusStyle.dark.text,
                    statusStyle.dark.border
                  )}
                >
                  <div className={cn("w-1.5 h-1.5 rounded-full mr-1.5", statusStyle.dot, statusStyle.dark.dot)} />
                  {STATUS_LABELS[project.status]}
                </Badge>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#0055A4] dark:group-hover:text-[#4a9eff] transition-colors">
              {project.nome}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
              {truncateText(project.descricao, 120)}
            </p>
          </div>

          {/* Footer / Action */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-5"
          >
            <Button
              variant="primary"
              size="sm"
              className="w-full group/btn bg-[#0055A4] hover:bg-[#004488]"
              rightIcon={<ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />}
            >
              {hasLink ? 'Acessar' : 'Ver detalhes'}
            </Button>
          </motion.div>

          {/* Hover Glow Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 85, 164, 0.08), transparent 40%)',
            }}
          />
        </Card>
      </CardWrapper>
    </motion.div>
  );
}
