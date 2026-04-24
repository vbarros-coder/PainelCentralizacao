/**
 * Hero Section Component
 * Seção de destaque com identidade visual Addvalora
 */

'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';
import Image from 'next/image';

import { useProjects } from '@/features/projects/use-projects';

export function HeroSection() {
  const { projects } = useProjects();

  // Calcular estatísticas reais
  const totalProjects = projects.filter(p => p.tipo === 'projeto').length;
  const uniqueDirectorates = new Set(projects.map(p => p.diretoria)).size;

  return (
    <section className="relative overflow-hidden">
      {/* Background Effects com cores Addvalora */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs - Azul e Laranja Addvalora (sem verde predominante) */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-[#0055A4]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#F47920]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0055A4]/5 rounded-full blur-3xl"
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Addvalora */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="w-48 h-16 relative">
              <Image
                src="/logo-addvalora.png"
                alt="Addvalora Global"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0055A4]/10 dark:bg-[#0055A4]/20 border border-[#0055A4]/20 dark:border-[#0055A4]/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#0055A4]" />
            <span className="text-sm font-medium text-[#0055A4] dark:text-[#60a5fa]">
              Núcleo de Inteligência Estratégica
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight"
          >
            Painel de Projetos{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-[#0055A4] to-[#F47920] bg-clip-text text-transparent">
                NIE
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#0055A4] to-[#F47920] rounded-full origin-left"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Acesso centralizado às soluções estratégicas, operacionais e tecnológicas.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {[
              { value: totalProjects.toString(), label: 'Projetos Totais', color: '#0055A4' },
              { value: uniqueDirectorates.toString(), label: 'Diretorias', color: '#F47920' },
              { value: '100%', label: 'Seguro', color: '#0055A4' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div 
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-gray-400"
            >
              <span className="text-xs">Role para explorar</span>
              <ArrowDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
