/**
 * Admin - Gestão de Usuários
 * Página para gerenciar usuários do sistema com controle de acesso
 */

'use client';

import { useState, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Lock, Unlock, UserX, UserCheck, Trash2, 
  Shield, Clock, AlertCircle, ChevronDown, ChevronUp, 
  RefreshCw, Filter, Ban, CheckCircle, Mail, User2
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
  const { getAllUsers, updateUserAdmin, user: currentUser, isGlobalAdmin } = useAuth();
  const { showToast } = useToast();
  const allUsers = getAllUsers();

  // IDs com permissão de excluir: ADM NIE, Luciana Hey e William Fernandez
  const DELETE_ALLOWED_IDS = ['usr-001', 'usr-ceo-1', 'usr-ceo-2'];
  const canDelete = currentUser ? DELETE_ALLOWED_IDS.includes(currentUser.id) : false;

  // IDs excluídos localmente (somem da lista imediatamente)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'block' | 'unblock' | 'deactivate' | 'reactivate' | 'delete' | 'approve' | 'reject' | null;
    user: User | null;
  }>({ isOpen: false, action: null, user: null });

  // Filtrar usuários
  const filteredUsers = useMemo(() => {
    let result = allUsers.filter(u => !deletedIds.has(u.id));
    
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

  const canEdit = isGlobalAdmin();

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
        setDeletedIds(prev => new Set([...prev, confirmModal.user!.id]));
        showToast(`Usuário ${confirmModal.user.name} excluído`, 'info');
        break;
      case 'approve':
        updateUserAdmin(confirmModal.user.id, {
          status: 'ativo',
          deactivatedAt: undefined,
          deactivatedBy: undefined,
        });
        showToast(`Acesso de ${confirmModal.user.name} aprovado`, 'success');
        break;
      case 'reject':
        setDeletedIds(prev => new Set([...prev, confirmModal.user!.id]));
        showToast(`Solicitação de ${confirmModal.user.name} rejeitada`, 'info');
        break;
    }
    
    setConfirmModal({ isOpen: false, action: null, user: null });
  };

  const openConfirmModal = (user: User, action: 'block' | 'unblock' | 'deactivate' | 'reactivate' | 'delete' | 'approve' | 'reject') => {
    // Ações de aprovação de acesso: só ADM NIE, Luciana e William
    if ((action === 'approve' || action === 'reject') && !canDelete) {
      showToast('Apenas ADM NIE, Luciana Hey e William Fernandez podem aprovar ou rejeitar acessos', 'error');
      return;
    }
    if (!canEdit && action !== 'approve' && action !== 'reject') {
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
      approve: {
        title: 'Aprovar Solicitação de Acesso',
        message: `Aprovar o acesso de ${confirmModal.user.name} ao sistema? O usuário será ativado e poderá fazer login imediatamente.`,
        confirmText: 'Aprovar Acesso',
        variant: 'info' as const,
      },
      reject: {
        title: 'Rejeitar Solicitação de Acesso',
        message: `Rejeitar a solicitação de ${confirmModal.user.name}? O registro será removido da fila de pendentes.`,
        confirmText: 'Rejeitar',
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
                    <Fragment key={user.id}>
                    <motion.tr 
                      key={`row-${user.id}`}
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
                        <div>
                          {user.profile === 'coordenacao' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-700">
                              Coordenação
                            </span>
                          ) : (
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {PROFILE_LABELS[user.profile] || user.profile}
                            </span>
                          )}
                          {user.diretoria && <p className="text-xs text-gray-400 mt-0.5">{user.diretoria}</p>}
                        </div>
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
                          {/* Botões de aprovação — SOMENTE para pendentes e SOMENTE para ADM/Luciana/William */}
                          {user.status === 'pendente' && canDelete && (
                            <>
                              <button
                                onClick={() => openConfirmModal(user, 'approve')}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                                title="Aprovar acesso"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Aprovar
                              </button>
                              <button
                                onClick={() => openConfirmModal(user, 'reject')}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                title="Rejeitar solicitação"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                Rejeitar
                              </button>
                            </>
                          )}

                          {/* Botões de usuários ativos — só para quem pode editar */}
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

                          {/* Excluir — só para ADM NIE, Luciana e William */}
                          {canDelete && user.id !== currentUser?.id && (
                            <button
                              onClick={() => openConfirmModal(user, 'delete')}
                              className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Excluir usuário"
                            >
                              <Trash2 className="w-4 h-4" />
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

                    {/* Painel expandido com perfil detalhado */}
                    {expandedUser === user.id && (
                      <motion.tr
                        key={`${user.id}-expanded`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td colSpan={5} className="px-6 pb-4 pt-0 bg-gray-50 dark:bg-gray-800/30">
                          <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm max-w-sm">
                            <Avatar src={user.avatar} name={user.name} size="md" />
                            <div className="flex flex-col gap-1.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                                <span className="text-xs text-gray-400">● {user.status === 'ativo' ? 'Online' : 'Offline'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                {user.profile === 'coordenacao' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-700 tracking-wide uppercase">
                                    Coordenação
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    {PROFILE_LABELS[user.profile] || user.profile}
                                  </span>
                                )}
                              </div>
                              {user.email && (
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="text-xs text-gray-500 truncate">{user.email}</span>
                                </div>
                              )}
                              {user.diretoria && (
                                <div className="flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="text-xs text-gray-500">{user.diretoria}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                    </Fragment>
                  ))}                </AnimatePresence>
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
