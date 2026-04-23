/**
 * Project Card Component
 * Card de projeto com identidade visual Addvalora (Azul e Laranja)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  Star,
  Calendar,
  Users,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { cn, truncateText, formatDate } from '@/lib/utils';
import { Badge, Card, Button } from '@/components/ui';
import { Project } from '@/types';
import { categoryColors, statusColors } from '@/lib/design-system';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/mock-data';

interface ProjectCardProps {
  project: Project;
  onToggleFavorite: (id: string) => void;
  onToggleDestaque?: (id: string) => void;
  isUserDestaque?: boolean;
  index?: number;
}

export function ProjectCard({ 
  project, 
  onToggleFavorite, 
  onToggleDestaque,
  isUserDestaque = false,
  index = 0 
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const categoryStyle = categoryColors[project.categoria];
  const statusStyle = statusColors[project.status];

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavoriting(true);
    onToggleFavorite(project.id);
    setTimeout(() => setIsFavoriting(false), 300);
  };

  const handleDestaque = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleDestaque) {
      onToggleDestaque(project.id);
    }
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
    >
      <Link href={project.link} target="_blank" rel="noopener noreferrer">
        <Card
          isHoverable
          className={cn(
            'relative overflow-hidden group',
            'h-full flex flex-col',
            (project.destaque || isUserDestaque) && 'ring-2 ring-[#0055A4]/50 dark:ring-[#0055A4]/30'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Destaque Badge - Azul Addvalora */}
          {(project.destaque || isUserDestaque) && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Badge 
                  variant="warning" 
                  size="sm" 
                  className={cn(
                    "shadow-sm flex items-center gap-1",
                    isUserDestaque && !project.destaque
                      ? 'bg-[#F47920]/10 text-[#F47920] border-[#F47920]/20'
                      : 'bg-[#0055A4]/10 text-[#0055A4] border-[#0055A4]/20'
                  )}
                >
                  <Sparkles className="w-3 h-3" />
                  {isUserDestaque && !project.destaque ? 'Meu Destaque' : 'Destaque'}
                </Badge>
              </motion.div>
              
              {/* Toggle Destaque Button */}
              {onToggleDestaque && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDestaque}
                  className={cn(
                    'p-1.5 rounded-full transition-colors ml-1',
                    isUserDestaque
                      ? 'text-[#F47920] bg-[#F47920]/10'
                      : 'text-gray-400 hover:text-[#F47920] hover:bg-[#F47920]/10'
                  )}
                  title={isUserDestaque ? 'Remover dos meus destaques' : 'Adicionar aos meus destaques'}
                >
                  <Heart className={cn('w-3.5 h-3.5', isUserDestaque && 'fill-current')} />
                </motion.button>
              )}
            </div>
          )}

          {/* User Destaque Toggle (quando não é destaque) */}
          {!project.destaque && !isUserDestaque && onToggleDestaque && (
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDestaque}
                className="p-1.5 rounded-full text-gray-400 hover:text-[#F47920] hover:bg-[#F47920]/10 transition-colors"
                title="Adicionar aos meus destaques"
              >
                <Heart className="w-3.5 h-3.5" />
              </motion.button>
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

              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavorite}
                className={cn(
                  'p-1.5 rounded-full transition-colors',
                  project.favorito
                    ? 'text-[#F47920] bg-[#F47920]/10 dark:bg-[#F47920]/20'
                    : 'text-gray-400 hover:text-[#F47920] hover:bg-[#F47920]/10 dark:hover:bg-[#F47920]/20'
                )}
              >
                <motion.div
                  animate={isFavoriting ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={cn(
                      'w-4 h-4 transition-all',
                      project.favorito && 'fill-current'
                    )}
                  />
                </motion.div>
              </motion.button>
            </div>

            {/* Title - Azul Addvalora no hover */}
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#0055A4] dark:group-hover:text-[#4a9eff] transition-colors">
              {project.nome}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
              {truncateText(project.descricao, 120)}
            </p>

            {/* Progress Bar - Azul e Laranja Addvalora */}
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

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{project.responsavel}</span>
              </div>
              {project.dataFim && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(project.dataFim)}</span>
                </div>
              )}
            </div>
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
              Acessar Projeto
            </Button>
          </motion.div>

          {/* Hover Glow Effect - Azul Addvalora */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 85, 164, 0.08), transparent 40%)',
            }}
          />
        </Card>
      </Link>
    </motion.div>
  );
}
