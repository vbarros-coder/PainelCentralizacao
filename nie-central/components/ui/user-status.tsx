/**
 * User Status Components
 * Badge visual de status e seletor inspirado no Discord/Slack
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, MinusCircle, Circle, ChevronDown } from 'lucide-react';
import { UserPresenceStatus } from '@/types';
import { useAuth } from '@/features/auth/auth-context';
import { cn } from '@/lib/utils';

// ============================================
// CONFIGURAÇÕES VISUAIS
// ============================================

const STATUS_CONFIG = {
  available: {
    label: 'Disponível',
    color: 'bg-emerald-500',
    icon: Check,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20'
  },
  away: {
    label: 'Ausente',
    color: 'bg-amber-500',
    icon: Clock,
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20'
  },
  busy: {
    label: 'Ocupado',
    color: 'bg-red-500',
    icon: MinusCircle,
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/20'
  },
  offline: {
    label: 'Offline',
    color: 'bg-slate-400',
    icon: Circle,
    bg: 'bg-slate-400/10',
    text: 'text-slate-400',
    border: 'border-slate-400/20'
  }
};

// ============================================
// USER STATUS BADGE
// ============================================

interface UserStatusBadgeProps {
  status: UserPresenceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function UserStatusBadge({ 
  status = 'offline', 
  size = 'md', 
  showLabel = false,
  className 
}: UserStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const iconSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className={cn(
        "relative flex items-center justify-center rounded-full",
        dotSizes[size],
        config.color
      )}>
        <Icon className={cn("text-white fill-white", iconSizes[size])} strokeWidth={4} />
      </div>
      {showLabel && (
        <span className={cn(
          "text-xs font-medium",
          size === 'sm' ? 'text-[10px]' : 'text-xs',
          config.text
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// ============================================
// USER STATUS SELECTOR
// ============================================

export function UserStatusSelector() {
  const { user, updateUserPresence } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const currentStatus = user.presence?.status || 'offline';
  const config = STATUS_CONFIG[currentStatus];

  const options: UserPresenceStatus[] = ['available', 'away', 'busy'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <UserStatusBadge status={currentStatus} size="md" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {config.label}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-1.5 z-50"
            >
              {options.map((opt) => {
                const optConfig = STATUS_CONFIG[opt];
                const OptIcon = optConfig.icon;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      updateUserPresence(opt);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      currentStatus === opt 
                        ? "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", optConfig.color)} />
                    <span className="flex-1 text-left">{optConfig.label}</span>
                    {currentStatus === opt && <Check className="w-4 h-4 text-[#0055A4]" />}
                  </button>
                );
              })}
              
              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
              
              <button
                onClick={() => {
                  updateUserPresence(null);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="flex-1 text-left">Automático</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// FORMAT LAST ACTIVE
// ============================================

export function formatLastActive(timestamp?: number) {
  if (!timestamp) return 'Offline';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Ativo agora';
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Ativo há ${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Ativo há ${hours}h`;
  
  return new Date(timestamp).toLocaleDateString('pt-BR');
}
