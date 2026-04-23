/**
 * Topbar Component
 * Barra superior com informações do usuário e ambiente
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Sun,
  Moon,
  HelpCircle,
  Shield,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';
import { Button, Badge, Avatar, Tooltip } from '@/components/ui';
import { UserStatusSelector, UserStatusBadge, formatLastActive } from '@/components/ui/user-status';

interface TopbarProps {
  isSidebarCollapsed: boolean;
}

// Notificações mock
const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Novo projeto adicionado', message: 'Painel de Controle de Prazos', time: '2 min atrás', unread: true },
  { id: 2, title: 'Atualização de sistema', message: 'Nova versão disponível', time: '1 hora atrás', unread: true },
  { id: 3, title: 'Bem-vindo!', message: 'Central de Projetos NIE', time: '2 dias atrás', unread: false },
];

export function Topbar({ isSidebarCollapsed }: TopbarProps) {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  // Evita hydration mismatch - não renderiza o botão de tema até montar
  const ThemeToggle = () => {
    if (!mounted) return (
      <div className="p-2 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
    );
    
    const isDark = resolvedTheme === 'dark';
    
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="p-2 text-gray-500 hover:text-[#0055A4] dark:text-gray-400 dark:hover:text-[#60a5fa] hover:bg-[#0055A4]/10 dark:hover:bg-[#0055A4]/20 rounded-lg transition-colors"
        aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'dark' : 'light'}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          'fixed top-0 right-0 h-16 bg-card/80 backdrop-blur-xl',
          'border-b border-border',
          'flex items-center justify-between px-6 z-40',
          'transition-all duration-300',
          isSidebarCollapsed ? 'left-20' : 'left-72'
        )}
      >
        {/* Left side - Breadcrumb / Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Painel de Projetos
          </h1>
          <Badge variant="info" size="sm">
            <Shield className="w-3 h-3 mr-1" />
            Ambiente Seguro
          </Badge>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearch(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Buscar... </span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs font-mono">
              ⌘K
            </kbd>
          </motion.button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Help - Abre Addvalu Chat */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-addvalu-chat'));
            }}
            className="p-2 text-gray-500 hover:text-[#0055A4] dark:text-gray-400 dark:hover:text-[#60a5fa] hover:bg-[#0055A4]/10 dark:hover:bg-[#0055A4]/20 rounded-lg transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-[#0055A4] dark:text-gray-400 dark:hover:text-[#60a5fa] hover:bg-[#0055A4]/10 dark:hover:bg-[#0055A4]/20 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F47920] rounded-full animate-pulse" />
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowNotifications(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                          Nenhuma notificação
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <motion.div
                            key={notif.id}
                            whileHover={{ backgroundColor: 'rgba(0, 85, 164, 0.05)' }}
                            onClick={() => markAsRead(notif.id)}
                            className={cn(
                              'p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors',
                              notif.unread && 'bg-[#0055A4]/5 dark:bg-[#0055A4]/10'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              {notif.unread && (
                                <span className="w-2 h-2 bg-[#F47920] rounded-full mt-1.5 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {notif.time}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

          {/* User Presence Selector */}
          <div className="hidden md:block">
            <UserStatusSelector />
          </div>

          {/* User Menu */}
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 85, 164, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-border"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-1">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                {user?.email}
              </p>
            </div>
            <div className="relative">
              <Avatar
                src={user?.avatar}
                name={user?.name}
                size="sm"
              />
              <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 p-0.5 rounded-full">
                <UserStatusBadge 
                  status={user?.presence?.status || 'offline'} 
                  size="sm" 
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar projetos..."
                  autoFocus
                  className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                />
                <button 
                  onClick={() => setShowSearch(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-2">
                  Projetos disponíveis
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'Painel de Controle de Prazos', link: 'https://nie-prazos.pages.dev/' },
                    { name: 'Painel de Acionamentos', link: 'https://painel.nie-inteligencia.com' },
                    { name: 'Módulos de Treinamento', link: 'https://instituto-addvalora-nie.vercel.app/' },
                  ].map((proj) => (
                    <a
                      key={proj.name}
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#00A651]/5 dark:hover:bg-[#00A651]/10 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#00A651]/10 flex items-center justify-center">
                        <Search className="w-4 h-4 text-[#00A651]" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{proj.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
