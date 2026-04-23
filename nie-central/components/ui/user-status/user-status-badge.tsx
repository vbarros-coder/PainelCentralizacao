/**
 * User Status Badge
 * Exibe o status de presença do usuário
 */

'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Minus, Circle } from 'lucide-react';
import { usePresence } from '@/features/presence/presence-context';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { PresenceStatus } from '@/features/presence/presence-context';

interface UserStatusBadgeProps {
  userId?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<PresenceStatus, { color: string; icon: React.ReactNode; label: string }> = {
  available: {
    color: 'bg-green-500',
    icon: <Check className="w-2.5 h-2.5 text-white" />,
    label: 'Disponível',
  },
  away: {
    color: 'bg-yellow-500',
    icon: <Clock className="w-2.5 h-2.5 text-white" />,
    label: 'Ausente',
  },
  busy: {
    color: 'bg-red-500',
    icon: <Minus className="w-2.5 h-2.5 text-white" />,
    label: 'Ocupado',
  },
  offline: {
    color: 'bg-gray-400',
    icon: <Circle className="w-2.5 h-2.5 text-white" />,
    label: 'Offline',
  },
};

export function UserStatusBadge({ 
  userId, 
  showLabel = false, 
  size = 'md',
  className 
}: UserStatusBadgeProps) {
  const { effectiveStatus, getStatusLabel } = usePresence();
  
  // Para sistema single-user, usamos o status efetivo do contexto
  // Quando houver multi-user, isso pode ser expandido
  const status = effectiveStatus;
  const config = statusConfig[status];
  const label = getStatusLabel();

  const sizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const iconSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          'relative rounded-full flex items-center justify-center',
          sizeClasses[size],
          config.color
        )}
      >
        {status === 'available' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <span className={cn('relative z-10', iconSizes[size])}>
          {config.icon}
        </span>
      </motion.div>
      
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
    </div>
  );

  if (showLabel) {
    return content;
  }

  return (
    <Tooltip content={label}>
      {content}
    </Tooltip>
  );
}
