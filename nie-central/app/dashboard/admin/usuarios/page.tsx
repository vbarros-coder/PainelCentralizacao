/**
 * Admin - Gestão de Usuários
 * Página para gerenciar usuários do sistema com controle de acesso
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Lock, Unlock, UserX, UserCheck, Trash2, 
  Shield, Clock, AlertCircle, ChevronDown, ChevronUp, 
  RefreshCw, Filter, Ban, CheckCircle
} from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { useAuth } from '@/features/auth/auth-context';
import { Card, Button, Avatar } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { PROFILE_LABELS } from '@/lib/mock-data';
import { User, UserStatus, UserProfile } from '@/types';

// Modal de confirmação
function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-[#00A651] hover:bg-[#008c44]',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>{cancelText}</Button>
          <Button className={variantStyles[variant]} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Badge de status
function StatusBadge({ status }: { status: UserStatus }) {
  const styles = {
    ativo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pendente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    inativo: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    bloqueado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    desligado: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const labels = {
    ativo: 'Ativo',
    pendente: 'Pendente',
    inativo: 'Inativo',
    bloqueado: 'Bloqueado',
    desligado: 'Desligado',
  };

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', styles[status])}>
      {labels[status]}
    </span>
  );
}

// Card de estatísticas
function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function UserManagementContent() {
  const { getAllUsers, updateUserAdmin, user: currentUser, isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const allUsers = getAllUsers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'block' | 'unblock' | 'deactivate' | 'reactivate' | 'delete' | null;
    user: User | null;
  }>({ isOpen: false, action: null, user: null });

  // Filtrar usuários
  const filteredUsers = useMemo(() => {
    let result = allUsers;
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery) ||
        u.cargo?.toLowerCase().includes(lowerQuery) ||
        u.diretoria?.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter);
    }
    
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allUsers, searchQuery, statusFilter]);

  // Estatísticas
  const stats = useMemo(() => ({
    total: allUsers.length,
    ativos: allUsers.filter(u => u.status === 'ativo').length,
    bloqueados: allUsers.filter(u => u.status === 'bloqueado').length,
    desligados: allUsers.filter(u => u.status === 'desligado').length,
    pendentes: allUsers.filter(u => u.status === 'pendente').length,
  }), [allUsers]);

  const canEdit = isSuperAdmin();

  const handleConfirmAction = () => {
    if (!confirmModal.user || !confirmModal.action) return;
    
    const now = new Date().toISOString();
    
    switch (confirmModal.action) {
      case 'block':
        updateUserAdmin(confirmModal.user.id, { 
          status: 'bloqueado',
          deactivatedAt: now,
          deactivatedBy: currentUser?.id 
        });
        showToast(`Usuário ${confirmModal.user.name} bloqueado com sucesso`, 'success');
        break;
      case 'unblock':
        updateUserAdmin(confirmModal.user.id, { 
          status: 'ativo',
          deactivatedAt: undefined,
          deactivatedBy: undefined 
        });
        showToast(`Usuário ${confirmModal.user.name} desbloqueado`, 'success');
        break;
      case 'deactivate':
        updateUserAdmin(confirmModal.user.id, { 
          status: 'desligado',
          deactivatedAt: now,
          deactivatedBy: currentUser?.id 
        });
        showToast(`Usuário ${confirmModal.user.name} desativado (desligamento)`, 'success');
        break;
      case 'reactivate':
        updateUserAdmin(confirmModal.user.id, { 
          status: 'ativo',
          deactivatedAt: undefined,
          deactivatedBy: undefined 
        });
        showToast(`Usuário ${confirmModal.user.name} reativado`, 'success');
        break;
      case 'delete':
        updateUserAdmin(confirmModal.user.id, { 
          status: 'inativo',
          deactivatedAt: now,
          deactivatedBy: currentUser?.id 
        });
        showToast(`Usuário ${confirmModal.user.name} excluído`, 'info');
        break;
    }
    
    setConfirmModal({ isOpen: false, action: null, user: null });
  };

  const openConfirmModal = (user: User, action: 'block' | 'unblock' | 'deactivate' | 'reactivate' | 'delete') => {
    if (!canEdit) {
      showToast('Você não tem permissão para realizar esta ação', 'error');
      return;
    }
    setConfirmModal({ isOpen: true, action, user });
  };

  const getConfirmModalProps = () => {
    if (!confirmModal.user || !confirmModal.action) return null;
    
    const configs = {
      block: {
        title: 'Bloquear Usuário',
        message: `Tem certeza que deseja bloquear ${confirmModal.user.name}? O acesso será impedido imediatamente.`,
        confirmText: 'Bloquear',
        variant: 'warning' as const,
      },
      unblock: {
        title: 'Desbloquear Usuário',
        message: `Desbloquear ${confirmModal.user.name}? O usuário poderá acessar o sistema novamente.`,
        confirmText: 'Desbloquear',
        variant: 'info' as const,
      },
      deactivate: {
        title: 'Desativar Usuário (Desligamento)',
        message: `Desativar ${confirmModal.user.name}? Esta ação representa o desligamento do colaborador e impedirá qualquer acesso ao sistema.`,
        confirmText: 'Desativar',
        variant: 'danger' as const,
      },
      reactivate: {
        title: 'Reativar Usuário',
        message: `Reativar ${confirmModal.user.name}? O usuário terá acesso restaurado ao sistema.`,
        confirmText: 'Reativar',
        variant: 'info' as const,
      },
      delete: {
        title: 'Excluir Usuário',
        message: `Excluir ${confirmModal.user.name}? Esta ação marca o usuário como inativo e não pode ser desfeita.`,
        confirmText: 'Excluir',
        variant: 'danger' as const,
      },
    };
    
    return configs[confirmModal.action];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#0055A4] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Usuários</h1>
              <p className="text-gray-500 dark:text-gray-400">Gerencie acessos, bloqueios e desligamentos</p>
            </div>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
        >
          <StatCard title="Total" value={stats.total} icon={Users} color="bg-blue-600" />
          <StatCard title="Ativos" value={stats.ativos} icon={CheckCircle} color="bg-green-600" />
          <StatCard title="Bloqueados" value={stats.bloqueados} icon={Lock} color="bg-red-600" />
          <StatCard title="Desligados" value={stats.desligados} icon={UserX} color="bg-orange-600" />
          <StatCard title="Pendentes" value={stats.pendentes} icon={Clock} color="bg-yellow-600" />
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou cargo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {(['all', 'ativo', 'bloqueado', 'desligado', 'pendente'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    statusFilter === status
                      ? 'bg-[#00A651] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  )}
                >
                  {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Lista de Usuários */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Perfil</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Último Acesso</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} name={user.name} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.cargo && <p className="text-xs text-gray-400">{user.cargo}</p>}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {PROFILE_LABELS[user.profile] || user.profile}
                        </span>
                        {user.diretoria && <p className="text-xs text-gray-400">{user.diretoria}</p>}
                      </td>
                      
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString('pt-BR')
                            : 'Nunca acessou'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === 'ativo' && (
                            <>
                              <button
                                onClick={() => openConfirmModal(user, 'block')}
                                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Bloquear"
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openConfirmModal(user, 'deactivate')}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Desativar (Desligamento)"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {user.status === 'bloqueado' && (
                            <button
                              onClick={() => openConfirmModal(user, 'unblock')}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Desbloquear"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                          
                          {(user.status === 'desligado' || user.status === 'inativo') && (
                            <button
                              onClick={() => openConfirmModal(user, 'reactivate')}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Reativar"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                          >
                            {expandedUser === user.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de Confirmação */}
      {confirmModal.isOpen && getConfirmModalProps() && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, action: null, user: null })}
          onConfirm={handleConfirmAction}
          {...getConfirmModalProps()!}
        />
      )}
    </div>
  );
}

export default function AdminUsuariosPage() {
  return (
    <ProtectedRoute requiredProfiles={['admin', 'executivo']}>
      <UserManagementContent />
    </ProtectedRoute>
  );
}
