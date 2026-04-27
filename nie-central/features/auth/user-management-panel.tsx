/**
 * User Management Panel
 * Central de Gerenciamento de Acessos, Cargos e Permissões
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Edit2, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  MoreVertical,
  Check,
  X,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronRight,
  Layout,
  Briefcase,
  Layers,
  Save,
  Clock,
  History
} from 'lucide-react';
import { useAuth } from './auth-context';
import { User, UserRole, UserStatus, Project } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, Badge } from '@/components/ui';
import { 
  ROLE_LABELS, 
  getRoleLabel, 
  canManageUser, 
  canAssignRole,
  canAssignDirectorate,
  isGlobalAdmin 
} from '@/lib/permissions';
import { MOCK_PROJECTS } from '@/lib/mock-data';

// ============================================
// CONSTANTS
// ============================================

const DIRECTORATES = [
  'Property / Construção',
  'Property / Transportes / Mecânica / Elétrica',
  'Garantia / Fiança / Riscos',
  'Responsabilidade Civil Geral (RCG)',
  'Responsabilidade Civil Profissional (RCP)',
];

const ROLES: UserRole[] = [
  'adm-nie',
  'executivo-luciana',
  'executivo-william',
  'diretor',
  'coordenacao',
  'operacional',
  'visualizador'
];

// ============================================
// COMPONENTS
// ============================================

export function UserManagementPanel() {
  const { user: currentUser, getAllUsers, updateUserAdmin, logAction, getLogs } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [directorateFilter, setDirectorateFilter] = useState<string | 'all'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const users = getAllUsers();
  const pendingUsersCount = useMemo(() => users.filter(u => u.status === 'pendente').length, [users]);
  const projects = MOCK_PROJECTS.filter(p => p.tipo === 'projeto');
  const panels = MOCK_PROJECTS.filter(p => p.tipo === 'painel');

  // Filtragem de usuários
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                           u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesDirectorate = directorateFilter === 'all' || u.diretoria === directorateFilter;
      
      // Filtro de visibilidade: Diretores só veem usuários da sua diretoria
      const canSeeUser = isGlobalAdmin(currentUser) || 
                        (currentUser?.role === 'diretor' && currentUser.diretoria === u.diretoria);

      return matchesSearch && matchesRole && matchesStatus && matchesDirectorate && canSeeUser;
    });
  }, [users, search, roleFilter, statusFilter, directorateFilter, currentUser]);

  const handleEditUser = (user: User) => {
    if (canManageUser(currentUser, user)) {
      setEditingUser({ ...user });
    }
  };

  const handleSaveUser = () => {
    if (!editingUser || !currentUser) return;

    // Auditoria detalhada
    const originalUser = users.find(u => u.id === editingUser.id);
    if (originalUser) {
      const changes: string[] = [];
      if (originalUser.role !== editingUser.role) changes.push(`Cargo: [${originalUser.role}] -> [${editingUser.role}]`);
      if (originalUser.diretoria !== editingUser.diretoria) changes.push(`Diretoria: [${originalUser.diretoria || 'Nenhuma'}] -> [${editingUser.diretoria || 'Nenhuma'}]`);
      if (originalUser.status !== editingUser.status) changes.push(`Status: [${originalUser.status}] -> [${editingUser.status}]`);
      
      // Projetos
      const addedProjects = editingUser.allowedProjects?.filter(p => !originalUser.allowedProjects?.includes(p)) || [];
      const removedProjects = originalUser.allowedProjects?.filter(p => !editingUser.allowedProjects?.includes(p)) || [];
      if (addedProjects.length > 0) changes.push(`Projetos adicionados: ${addedProjects.join(', ')}`);
      if (removedProjects.length > 0) changes.push(`Projetos removidos: ${removedProjects.join(', ')}`);

      // Painéis
      const addedPanels = editingUser.allowedPanels?.filter(p => !originalUser.allowedPanels?.includes(p)) || [];
      const removedPanels = originalUser.allowedPanels?.filter(p => !editingUser.allowedPanels?.includes(p)) || [];
      if (addedPanels.length > 0) changes.push(`Painéis adicionados: ${addedPanels.join(', ')}`);
      if (removedPanels.length > 0) changes.push(`Painéis removidos: ${removedPanels.join(', ')}`);
      
      if (changes.length > 0) {
        logAction(
          'Permissões Alteradas', 
          'AUDIT', 
          `Alterações para ${editingUser.name} (${editingUser.email}): ${changes.join(' | ')}`
        );
      }
    }

    updateUserAdmin(editingUser.id, editingUser);
    setEditingUser(null);
    
    // Disparar evento para Addvalu (Simulado)
    const event = new CustomEvent('addvalu-operational-event', {
      detail: {
        type: 'PERMISSION_CHANGE',
        userId: editingUser.id,
        changedBy: currentUser.id,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  };

  const toggleProject = (projectId: string) => {
    if (!editingUser) return;
    const currentProjects = editingUser.allowedProjects || [];
    const newProjects = currentProjects.includes(projectId)
      ? currentProjects.filter(id => id !== projectId)
      : [...currentProjects, projectId];
    
    setEditingUser({ ...editingUser, allowedProjects: newProjects });
  };

  const togglePanel = (panelId: string) => {
    if (!editingUser) return;
    const currentPanels = editingUser.allowedPanels || [];
    const newPanels = currentPanels.includes(panelId)
      ? currentPanels.filter(id => id !== panelId)
      : [...currentPanels, panelId];
    
    setEditingUser({ ...editingUser, allowedPanels: newPanels });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-[#0055A4]" />
            Gerenciamento de Acessos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Controle permissões, cargos e visibilidade de projetos por diretoria.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <History className="w-4 h-4" />
            Auditoria
          </button>
          <button 
            onClick={() => setStatusFilter('pendente')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm relative",
              statusFilter === 'pendente' 
                ? "bg-orange-500 text-white hover:bg-orange-600" 
                : "bg-[#0055A4] text-white hover:bg-[#004488]"
            )}
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
            {pendingUsersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 animate-pulse">
                {pendingUsersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0055A4] transition-all"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0055A4] transition-all min-w-[160px]"
        >
          <option value="all">Todos os Cargos</option>
          {ROLES.map(role => (
            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0055A4] transition-all min-w-[160px]"
        >
          <option value="all">Todos os Status</option>
          <option value="ativo">Ativo</option>
          <option value="pendente">Pendente</option>
          <option value="inativo">Inativo</option>
          <option value="bloqueado">Bloqueado</option>
        </select>

        {isGlobalAdmin(currentUser) && (
          <select
            value={directorateFilter}
            onChange={(e) => setDirectorateFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0055A4] transition-all min-w-[200px]"
          >
            <option value="all">Todas as Diretorias</option>
            {DIRECTORATES.map(dir => (
              <option key={dir} value={dir}>{dir}</option>
            ))}
          </select>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Diretoria</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {isGlobalAdmin(u) ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0055A4]" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getRoleLabel(u)}
                      </span>
                      {u.status === 'pendente' && u.requestedRoles && u.requestedRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {u.requestedRoles.map(role => (
                            <span key={role} className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full border border-orange-200">
                              {ROLE_LABELS[role] || role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {u.diretoria || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={u.status === 'ativo' ? 'success' : 'error'}>
                      {u.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditUser(u)}
                      disabled={!canManageUser(currentUser, u)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        canManageUser(currentUser, u) 
                          ? "text-[#0055A4] hover:bg-[#0055A4]/10" 
                          : "text-gray-300 cursor-not-allowed"
                      )}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-4">
                  <Avatar src={editingUser.avatar} name={editingUser.name} size="md" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingUser.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{editingUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" /> Cargo / Role
                    </label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                      disabled={!isGlobalAdmin(currentUser)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0055A4] transition-all disabled:opacity-50"
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" /> Diretoria
                    </label>
                    <select
                      value={editingUser.diretoria}
                      onChange={(e) => setEditingUser({ ...editingUser, diretoria: e.target.value })}
                      disabled={!isGlobalAdmin(currentUser)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0055A4] transition-all disabled:opacity-50"
                    >
                      <option value="">Nenhuma</option>
                      {DIRECTORATES.map(dir => (
                        <option key={dir} value={dir}>{dir}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5" /> Status da Conta
                    </label>
                    <div className="flex gap-2">
                      {(['ativo', 'bloqueado', 'inativo'] as UserStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => setEditingUser({ ...editingUser, status })}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                            editingUser.status === status
                              ? status === 'ativo' 
                                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800"
                                : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800"
                              : "bg-gray-50 border-gray-100 text-gray-500 dark:bg-gray-900 dark:border-gray-800"
                          )}
                        >
                          {status.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Projects & Panels */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5" /> Painéis Permitidos
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {panels.map(panel => (
                        <button
                          key={panel.id}
                          onClick={() => togglePanel(panel.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                            editingUser.allowedPanels?.includes(panel.id)
                              ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                              : "bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            editingUser.allowedPanels?.includes(panel.id)
                              ? "bg-[#0055A4] border-[#0055A4]"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          )}>
                            {editingUser.allowedPanels?.includes(panel.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                            {panel.nome}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                      <FolderKanban className="w-3.5 h-3.5" /> Projetos Permitidos
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {projects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => toggleProject(project.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                            editingUser.allowedProjects?.includes(project.id)
                              ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                              : "bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            editingUser.allowedProjects?.includes(project.id)
                              ? "bg-[#0055A4] border-[#0055A4]"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          )}>
                            {editingUser.allowedProjects?.includes(project.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                              {project.nome}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">{project.diretoria}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-8 py-2 bg-[#0055A4] text-white rounded-xl text-sm font-bold hover:bg-[#004488] transition-colors shadow-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <History className="w-5 h-5 text-[#0055A4]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Registro de Auditoria</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Histórico de alterações de permissões e acessos.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  {getLogs().filter(log => log.category === 'AUDIT' || log.category === 'ADMIN').length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum registro de auditoria encontrado.</p>
                    </div>
                  ) : (
                    getLogs()
                      .filter(log => log.category === 'AUDIT' || log.category === 'ADMIN')
                      .map((log) => (
                        <div key={log.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/20 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="text-[10px] uppercase font-bold">
                                {log.action}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <span className="font-bold">{log.user}</span>
                              <span>({log.email})</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {log.details}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end">
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-8 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Re-export icon for use in sidebar
const FolderKanban = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
    <path d="M8 10v4"/><path d="M12 10v4"/><path d="M16 10v4"/>
  </svg>
);
