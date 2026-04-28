/**
 * User Status Badge
 * Exibe o status de presença do usuário como um indicador limpo
 */

'use client';

import { motion } from 'framer-motion';
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

const statusConfig: Record<PresenceStatus, { color: string; label: string; ringColor: string }> = {
  available: {
    color: 'bg-green-500',
    label: 'Disponível',
    ringColor: 'ring-white dark:ring-gray-900',
  },
  away: {
    color: 'bg-yellow-500',
    label: 'Ausente',
    ringColor: 'ring-white dark:ring-gray-900',
  },
  busy: {
    color: 'bg-red-500',
    label: 'Ocupado',
    ringColor: 'ring-white dark:ring-gray-900',
  },
  offline: {
    color: 'bg-gray-400',
    label: 'Offline',
    ringColor: 'ring-white dark:ring-gray-900',
  },
};

export function UserStatusBadge({ 
  userId, 
  showLabel = false, 
  size = 'md',
  className 
}: UserStatusBadgeProps) {
  const { effectiveStatus, getStatusLabel } = usePresence();
  
  const status = effectiveStatus;
  const config = statusConfig[status];
  const label = getStatusLabel();

  const sizeClasses = {
    sm: 'w-2.5 h-2.5 ring-[1.5px]',
    md: 'w-3 h-3 ring-2',
    lg: 'w-4 h-4 ring-2',
  };

  const indicator = (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'rounded-full shrink-0',
        config.color,
        sizeClasses[size],
        config.ringColor,
        className
      )}
    >
      {status === 'available' && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full',
            config.color
          )}
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );

  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          {indicator}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      </div>
    );
  }

  return (
    <Tooltip content={label}>
      <div className="relative flex items-center justify-center">
        {indicator}
      </div>
    </Tooltip>
  );
}
