/**
 * Sidebar Component
 * Navegação lateral com identidade visual Addvalora
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Shield,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';
import { Avatar } from '@/components/ui';

import { UserProfile } from '@/types';
import { PROFILE_LABELS } from '@/lib/mock-data';

const navItems: { id: string; label: string; href: string; icon: React.ElementType; requiredProfile?: UserProfile[] }[] = [
  { id: 'dashboard', label: 'Painel', href: '/dashboard', icon: LayoutDashboard },
  { id: 'projetos', label: 'Projetos', href: '/dashboard/projetos', icon: FolderKanban },
  { id: 'equipe', label: 'Equipe', href: '/dashboard/equipe', icon: Users },
  { id: 'relatorios', label: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
  { id: 'admin', label: 'Administração', href: '/dashboard/admin', icon: Shield, requiredProfile: ['master_admin', 'admin'] },
  { id: 'configuracoes', label: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, checkPermission, canAccessReports } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const filteredNavItems = navItems.filter((item) => {
    // Automação: Bloqueio automático de Relatórios para quem não tem acesso
    if (item.id === 'relatorios' && !canAccessReports()) return false;
    
    if (!item.requiredProfile) return true;
    return checkPermission(item.requiredProfile);
  });

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'fixed left-0 top-0 h-screen bg-card',
        'border-r border-border',
        'flex flex-col z-50 shadow-lg'
      )}
    >
      {/* Header com Logo Addvalora */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="w-36 h-12 relative">
                <Image
                  src="/logo-addvalora.png"
                  alt="Addvalora Global"
                  fill
                  className="object-contain"
                  sizes="144px"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <div className="w-10 h-10 relative mx-auto">
            <Image
              src="/imagotipo-addvalora.png"
              alt="Addvalora"
              fill
              className="object-contain"
              sizes="40px"
            />
          </div>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-gray-500 hover:bg-[#0055A4]/10 hover:text-[#0055A4] dark:text-gray-400 dark:hover:bg-[#0055A4]/20',
            isCollapsed && 'mx-auto mt-2'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isHovered = hoveredItem === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="block"
            >
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 4 }}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'group cursor-pointer',
                  isActive
                    ? 'bg-[#0055A4]/10 text-[#0055A4] dark:bg-[#0055A4]/20 dark:text-[#60a5fa]'
                    : 'text-gray-600 hover:bg-[#0055A4]/5 hover:text-[#0055A4] dark:text-gray-400 dark:hover:bg-[#0055A4]/10'
                )}
              >
                {/* Active indicator - Azul Addvalora */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0055A4] rounded-r-full"
                  />
                )}

                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  isActive && 'text-[#0055A4] dark:text-[#60a5fa]'
                )} />

                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {isCollapsed && isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute left-full ml-2 px-3 py-1.5 bg-[#0055A4] text-white text-sm rounded-lg whitespace-nowrap z-50"
                  >
                    {item.label}
                  </motion.div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div
          className={cn(
            'flex items-center gap-3',
            isCollapsed && 'justify-center'
          )}
        >
          <Avatar
            src={user?.avatar}
            name={user?.name}
            size={isCollapsed ? 'sm' : 'md'}
          />

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.profile && PROFILE_LABELS[user.profile]}
                  {user?.diretoria && ` - ${user.diretoria}`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 text-gray-400 hover:text-[#F47920] hover:bg-[#F47920]/10 dark:hover:bg-[#F47920]/20 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
