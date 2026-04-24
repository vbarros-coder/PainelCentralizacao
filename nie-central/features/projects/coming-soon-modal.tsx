/**
 * Coming Soon Modal
 * Modal para projetos que ainda não possuem link de acesso
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { Project } from '@/types';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function ComingSoonModal({ isOpen, onClose, project }: ComingSoonModalProps) {
  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          {/* Decorative Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0055A4] via-[#F47920] to-[#0055A4]" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 pt-12 text-center">
            {/* Animated Icon */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto">
                <Rocket className="w-12 h-12 text-[#0055A4] animate-pulse" />
              </div>
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-2 -right-2 p-2 rounded-xl bg-[#F47920] text-white shadow-lg"
              >
                <Clock className="w-5 h-5" />
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Em Desenvolvimento
            </h2>
            <p className="text-[#0055A4] font-medium mb-4">
              {project.nome}
            </p>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Estamos trabalhando intensamente para disponibilizar esta solução estratégica. 
              Em breve, você terá acesso a todas as funcionalidades do {project.nome} diretamente por aqui.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-left">
                <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Segurança Total</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-left">
                <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Alta Performance</span>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full bg-[#0055A4] hover:bg-[#004488] text-white py-6 rounded-2xl text-lg font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Entendido
            </Button>
            
            <p className="mt-6 text-xs text-gray-400">
              Núcleo de Inteligência Estratégica • Addvalora
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
