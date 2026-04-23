/**
 * User Status Selector Component
 * Menu para selecionar status de presença
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Minus, Circle, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePresence, PresenceStatus } from '@/features/presence/presence-context';

const statusOptions: { value: PresenceStatus; label: string; color: string; icon: typeof Check }[] = [
  { value: 'available', label: 'Disponível', color: '#00A651', icon: Check },
  { value: 'away', label: 'Ausente', color: '#F47920', icon: Clock },
  { value: 'busy', label: 'Ocupado', color: '#ef4444', icon: Minus },
];

export function UserStatusSelector() {
  const { manualStatus, effectiveStatus, setManualStatus, isAutoStatus } = usePresence();
  const [isOpen, setIsOpen] = useState(false);

  const currentStatus = manualStatus || effectiveStatus;
  const currentConfig = statusOptions.find(s => s.value === currentStatus) || statusOptions[0];

  const handleSelect = (status: PresenceStatus) => {
    setManualStatus(status);
    setIsOpen(false);
  };

  const handleReset = () => {
    setManualStatus(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
          isOpen && 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: currentConfig.color }}
        />
        
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentConfig.label}
        </span>
        
        {isAutoStatus && (
          <span className="text-xs text-gray-400">(Auto)</span>
        )}
        
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </motion.button>

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
              className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">
                  Definir status
                </p>
                
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = manualStatus === option.value;
                  
                  return (
                    <motion.button
                      key={option.value}
                      whileHover={{ backgroundColor: 'rgba(0, 166, 81, 0.05)' }}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                        isSelected && 'bg-[#00A651]/10'
                      )}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${option.color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: option.color }} />
                      </div>
                      
                      <span className={cn(
                        'flex-1 text-left text-sm',
                        isSelected && 'font-medium text-gray-900 dark:text-white'
                      )}>
                        {option.label}
                      </span>
                      
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#00A651]" />
                      )}
                    </motion.button>
                  );
                })}

                <div className="border-t border-gray-200 dark:border-gray-800 my-2" />

                <motion.button
                  whileHover={{ backgroundColor: 'rgba(0, 166, 81, 0.05)' }}
                  onClick={handleReset}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isAutoStatus && 'bg-[#00A651]/10'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 text-gray-500" />
                  </div>
                  
                  <span className={cn(
                    'flex-1 text-left text-sm',
                    isAutoStatus && 'font-medium text-gray-900 dark:text-white'
                  )}>
                    Automático
                  </span>
                  
                  {isAutoStatus && (
                    <Check className="w-4 h-4 text-[#00A651]" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
