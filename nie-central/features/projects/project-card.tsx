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

  const categoryStyle = categoryColors[project.categoria];
  const statusStyle = statusColors[project.status];
  const hasLink = project.link && project.link !== '#';

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
          {/* Destaque Badge - Apenas selo oficial */}
          {project.destaque && (
            <div className="absolute top-3 right-3 z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Badge 
                  variant="warning" 
                  size="sm" 
                  className="shadow-sm flex items-center gap-1 bg-[#0055A4]/10 text-[#0055A4] border-[#0055A4]/20"
                >
                  <Sparkles className="w-3 h-3" />
                  Em destaque
                </Badge>
              </motion.div>
            </div>
          )}

          {/* Indicador de sem link */}
          {!hasLink && (
            <div className="absolute top-3 right-3 z-10">
              <Badge 
                variant="default" 
                size="sm" 
                className="shadow-sm flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200"
              >
                <Lock className="w-3 h-3" />
                Em breve
              </Badge>
            </div>
          )}

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

            {/* Progress Bar */}
            {project.progresso !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  <span>Progresso</span>
                  <span className="font-medium text-[#0055A4]">{project.progresso}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progresso}%` }}
                    transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
                    className={cn(
                      'h-full rounded-full',
                      project.progresso >= 80 && 'bg-[#0055A4]',
                      project.progresso >= 50 && project.progresso < 80 && 'bg-[#0055A4]/80',
                      project.progresso < 50 && 'bg-[#F47920]'
                    )}
                  />
                </div>
              </div>
            )}
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
