/**
 * Coming Soon Modal
 * Modal elegante para projetos em desenvolvimento
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Clock, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export function ComingSoonModal({ isOpen, onClose, projectName }: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="relative h-32 bg-gradient-to-br from-[#0055A4] via-[#0055A4] to-[#F47920] overflow-hidden">
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-10 -right-10 w-40 h-40 border-4 border-white/10 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-20 -left-10 w-60 h-60 border-2 border-white/5 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <Rocket className="w-16 h-16 text-white/90" />
                </motion.div>

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium mb-6">
                    <Clock className="w-4 h-4" />
                    Em desenvolvimento
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {projectName || 'Projeto em Evolução'}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Este projeto está sendo desenvolvido pelo <strong className="text-[#0055A4]">NIE</strong> e estará disponível em breve.
                  </p>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-8">
                    <Sparkles className="w-4 h-4 text-[#F47920]" />
                    <span>Em evolução pelo Núcleo de Inteligência Estratégica</span>
                  </div>

                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Planejamento</span>
                    </div>
                    <div className="w-16 h-0.5 bg-green-500"></div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#0055A4] flex items-center justify-center animate-pulse">
                        <Rocket className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-[#0055A4] font-medium mt-1">Desenvolvimento</span>
                    </div>
                    <div className="w-16 h-0.5 bg-gray-200"></div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-400 mt-1">Lançamento</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar aos projetos
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
