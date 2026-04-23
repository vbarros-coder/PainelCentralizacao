/**
 * User Status Badge Component
 * Exibe o status de presença do usuário
 */

'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Minus, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePresence } from '@/features/presence/presence-context';

interface UserStatusBadgeProps {
  showLabel?: boolean;
  showTime?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  available: {
    color: '#00A651',
    bgColor: 'bg-[#00A651]',
    icon: Check,
    label: 'Disponível',
  },
  away: {
    color: '#F47920',
    bgColor: 'bg-[#F47920]',
    icon: Clock,
    label: 'Ausente',
  },
  busy: {
    color: '#ef4444',
    bgColor: 'bg-red-500',
    icon: Minus,
    label: 'Ocupado',
  },
  offline: {
    color: '#9ca3af',
    bgColor: 'bg-gray-400',
    icon: Circle,
    label: 'Offline',
  },
};

export function UserStatusBadge({ 
  showLabel = false, 
  showTime = false,
  size = 'md',
  className 
}: UserStatusBadgeProps) {
  const { effectiveStatus, getTimeAgo, isAutoStatus } = usePresence();
  
  const config = statusConfig[effectiveStatus];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Bolinha de status com animação */}
      <motion.div
        className={cn(
          'rounded-full flex items-center justify-center',
          sizeClasses[size],
          config.bgColor
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {effectiveStatus === 'available' && (
          <motion.span
            className="absolute w-full h-full rounded-full bg-white/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <Icon className="w-2/3 h-2/3 text-white" strokeWidth={3} />
      </motion.div>

      {/* Label */}
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {config.label}
          {!isAutoStatus && (
            <span className="text-xs text-gray-400 ml-1">(manual)</span>
          )}
        </span>
      )}

      {/* Tempo */}
      {showTime && (effectiveStatus === 'offline' || effectiveStatus === 'away') && (
        <span className="text-xs text-gray-400">
          {getTimeAgo()}
        </span>
      )}
    </div>
  );
}
