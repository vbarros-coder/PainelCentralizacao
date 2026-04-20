/**
 * Usuários Cadastrados Page
 * Módulo administrativo para gestão de acessos e usuários
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Shield, 
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
  UserPlus,
  BadgeCheck,
  Mail,
  Building,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/features/auth/auth-context';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { Card, Button, Avatar } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { PROFILE_LABELS } from '@/lib/mock-data';
import { User, UserProfile, UserStatus } from '@/types';

function UsuariosCadastradosContent() {
  const { getAllUsers, updateUserAdmin, user: currentUser, isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const allUsers = getAllUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfile, setFilterProfile] = useState<UserProfile | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProfile = filterProfile === 'all' || user.profile === filterProfile;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesProfile && matchesStatus;
    }).sort((a, b) => {
      // Priorizar novos usuários
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [allUsers, searchTerm, filterProfile, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: allUsers.length,
      pendentes: allUsers.filter(u => u.status === 'pendente').length,
      ativos: allUsers.filter(u => u.status === 'ativo').length,
      novos: allUsers.filter(u => u.isNew).length
    };
  }, [allUsers]);

  const handleApprove = (userId: string) => {
    updateUserAdmin(userId, { status: 'ativo', isNew: false });
    showToast('Usuário aprovado com sucesso!', 'success');
  };

  const handleReject = (userId: string) => {
    updateUserAdmin(userId, { status: 'inativo', isNew: false });
    showToast('Usuário recusado.', 'info');
  };

  const handleMarkAsSeen = (userId: string) => {
    updateUserAdmin(userId, { isNew: false });
  };

  const handleChangeProfile = (userId: string, newProfile: UserProfile) => {
    updateUserAdmin(userId, { profile: newProfile });
    showToast(`Perfil atualizado para ${PROFILE_LABELS[newProfile]}`, 'success');
    setEditingUserId(null);
  };

  const canEdit = isSuperAdmin();

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Users className="w-8 h-8 text-[#F47920]" />
              Usuários Cadastrados
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestão centralizada de acessos, perfis e aprovações
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {allUsers.slice(0, 5).map((u) => (
                <Avatar key={u.id} src={u.avatar} name={u.name} size="sm" className="border-2 border-white dark:border-gray-900" />
              ))}
              {allUsers.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-500 border-2 border-white dark:border-gray-900">
                  +{allUsers.length - 5}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total de Usuários', value: stats.total, icon: Users, color: 'blue' },
            { label: 'Pendentes de Aprovação', value: stats.pendentes, icon: Clock, color: 'orange' },
            { label: 'Usuários Ativos', value: stats.ativos, icon: CheckCircle2, color: 'green' },
            { label: 'Novos Cadastros', value: stats.novos, icon: UserPlus, color: 'purple' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4 flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  stat.color === 'blue' && "bg-blue-100 text-blue-600",
                  stat.color === 'orange' && "bg-orange-100 text-orange-600",
                  stat.color === 'green' && "bg-green-100 text-green-600",
                  stat.color === 'purple' && "bg-purple-100 text-purple-600",
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-[#F47920] transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterProfile}
                onChange={(e) => setFilterProfile(e.target.value as any)}
                className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#F47920]"
              >
                <option value="all">Todos os Perfis</option>
                {Object.entries(PROFILE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#F47920]"
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="pendente">Pendente</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <Card className={cn(
                  "p-4 transition-all duration-300 border-l-4",
                  user.isNew ? "border-l-purple-500 bg-purple-50/30 dark:bg-purple-900/10" : "border-l-transparent",
                  user.status === 'pendente' && "bg-orange-50/30 dark:bg-orange-900/10"
                )}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar src={user.avatar} name={user.name} size="lg" />
                        {user.isNew && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border-2 border-white dark:border-gray-900"></span>
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
                          {user.isNew && (
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Novo
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                            {user.diretoria && <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {user.diretoria}</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={cn(
                              "text-[11px] font-bold px-2 py-0.5 rounded-full uppercase",
                              user.profile === 'master_admin' && "bg-red-100 text-red-600",
                              user.profile === 'admin' && "bg-[#F47920]/10 text-[#F47920]",
                              user.profile === 'executivo' && "bg-blue-100 text-blue-600",
                              user.profile === 'diretoria' && "bg-indigo-100 text-indigo-600",
                              user.profile === 'usuario' && "bg-green-100 text-green-600",
                            )}>
                              {PROFILE_LABELS[user.profile]}
                            </span>
                            <span className={cn(
                              "text-[11px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1",
                              user.status === 'ativo' && "bg-green-100 text-green-600",
                              user.status === 'pendente' && "bg-orange-100 text-orange-600",
                              user.status === 'inativo' && "bg-gray-100 text-gray-500",
                            )}>
                              {user.status === 'ativo' ? <CheckCircle2 className="w-3 h-3" /> : 
                               user.status === 'pendente' ? <Clock className="w-3 h-3" /> : 
                               <XCircle className="w-3 h-3" />}
                              {user.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.status === 'pendente' ? (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            disabled={!canEdit}
                            onClick={() => handleApprove(user.id)}
                          >
                            <Check className="w-4 h-4" /> Aprovar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50 gap-2 border-red-200"
                            disabled={!canEdit}
                            onClick={() => handleReject(user.id)}
                          >
                            <X className="w-4 h-4" /> Recusar
                          </Button>
                        </>
                      ) : (
                        <>
                          {user.isNew && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-purple-600 hover:bg-purple-50"
                              disabled={!canEdit}
                              onClick={() => handleMarkAsSeen(user.id)}
                            >
                              Marcar como visto
                            </Button>
                          )}
                          
                          <div className="flex items-center gap-2">
                            {editingUserId === user.id ? (
                              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                                <select
                                  value={user.profile}
                                  onChange={(e) => handleChangeProfile(user.id, e.target.value as UserProfile)}
                                  className="bg-transparent text-xs font-bold border-none focus:ring-0 py-1"
                                >
                                  {Object.entries(PROFILE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                  ))}
                                </select>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-gray-400"
                                  onClick={() => setEditingUserId(null)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-[#0055A4] hover:bg-[#0055A4]/10 gap-2"
                                disabled={!canEdit}
                                onClick={() => setEditingUserId(user.id)}
                              >
                                <Edit className="w-4 h-4" /> Perfil
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                    <div className="flex items-center gap-4">
                      <span>Cadastrado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                      {user.lastLogin && <span>Último acesso: {new Date(user.lastLogin).toLocaleString('pt-BR')}</span>}
                    </div>
                    {user.cargo && <span className="italic">{user.cargo}</span>}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredUsers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Nenhum usuário encontrado</h3>
              <p className="text-sm text-gray-400">Tente ajustar seus filtros ou busca.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UsuariosCadastradosPage() {
  return (
    <ProtectedRoute requiredProfiles={['master_admin', 'admin']}>
      <UsuariosCadastradosContent />
    </ProtectedRoute>
  );
}
