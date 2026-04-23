/**
 * User Status Selector
 * Menu para selecionar status manualmente
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Minus, Circle, ChevronDown, Sparkles } from 'lucide-react';
import { usePresence } from '@/features/presence/presence-context';
import { cn } from '@/lib/utils';
import type { PresenceStatus } from '@/features/presence/presence-context';

const statusOptions: { value: PresenceStatus | 'auto'; label: string; icon: React.ReactNode; color: string }[] = [
  { 
    value: 'available', 
    label: 'Disponível', 
    icon: <Check className="w-4 h-4" />, 
    color: 'text-green-500 bg-green-50 dark:bg-green-900/20' 
  },
  { 
    value: 'away', 
    label: 'Ausente', 
    icon: <Clock className="w-4 h-4" />, 
    color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
  },
  { 
    value: 'busy', 
    label: 'Ocupado', 
    icon: <Minus className="w-4 h-4" />, 
    color: 'text-red-500 bg-red-50 dark:bg-red-900/20' 
  },
  { 
    value: 'auto', 
    label: 'Automático', 
    icon: <Sparkles className="w-4 h-4" />, 
    color: 'text-[#00A651] bg-[#00A651]/10' 
  },
];

export function UserStatusSelector() {
  const { manualStatus, setManualStatus, effectiveStatus } = usePresence();
  const [isOpen, setIsOpen] = useState(false);

  const currentStatus = manualStatus || effectiveStatus;
  const currentOption = statusOptions.find(o => o.value === (manualStatus || 'auto')) || statusOptions[0];

  const handleSelect = (value: PresenceStatus | 'auto') => {
    if (value === 'auto') {
      setManualStatus(null);
    } else {
      setManualStatus(value);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
          'transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
          'border border-gray-200 dark:border-gray-700'
        )}
      >
        <span className={cn('w-2 h-2 rounded-full', 
          currentStatus === 'available' ? 'bg-green-500' :
          currentStatus === 'away' ? 'bg-yellow-500' :
          currentStatus === 'busy' ? 'bg-red-500' :
          'bg-gray-400'
        )} />
        <span className="text-gray-700 dark:text-gray-300">
          {currentOption.label}
        </span>
        
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-full left-0 mt-2 w-48',
                'bg-white dark:bg-gray-900 rounded-xl shadow-xl',
                'border border-gray-200 dark:border-gray-800',
                'z-50 overflow-hidden'
              )}
            >
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left',
                    'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                    'border-b border-gray-100 dark:border-gray-800 last:border-0',
                    (manualStatus || 'auto') === option.value && 'bg-gray-50 dark:bg-gray-800'
                  )}
                >
                  <span className={cn('p-1.5 rounded-lg', option.color)}>
                    {option.icon}
                  </span>
                  
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                  
                  {(manualStatus || 'auto') === option.value && (
                    <Check className="w-4 h-4 text-[#00A651]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
