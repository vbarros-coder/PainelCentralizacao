/**
 * User Management Context
 * Gerenciamento de usuários com auditoria
 */

'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, UserStatus, AuditLog, AuditActionType, UserProfile } from '@/types';
import { useAuth } from './auth-context';
import { MOCK_USERS, CURRENT_YEAR } from '@/lib/mock-data';

interface UserManagementContextType {
  users: User[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  // Ações
  blockUser: (userId: string, reason?: string) => void;
  unblockUser: (userId: string) => void;
  deactivateUser: (userId: string, reason?: string) => void;
  reactivateUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserProfile) => void;
  resetUserPassword: (userId: string) => void;
  // Filtros
  getUsersByStatus: (status: UserStatus) => User[];
  getUsersByDirectorate: (directorate: string) => User[];
  searchUsers: (query: string) => User[];
  // Auditoria
  getAuditLogs: (targetUserId?: string) => AuditLog[];
  // Permissões
  canManageUsers: () => boolean;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

// Chaves para localStorage
const USERS_STORAGE_KEY = 'nie_users';
const AUDIT_LOGS_STORAGE_KEY = 'nie_audit_logs';

// Lista de emails que podem gerenciar usuários
const ALLOWED_MANAGERS = [
  'admin@addvalora.com',
  'lhey@addvaloraglobal.com',
  'wfernandez@addvaloraglobal.com',
];

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const storedLogs = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Inicializar com MOCK_USERS
      setUsers(MOCK_USERS);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(MOCK_USERS));
    }
    
    if (storedLogs) {
      setAuditLogs(JSON.parse(storedLogs));
    }
    
    setIsLoading(false);
  }, []);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, [users, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(auditLogs));
    }
  }, [auditLogs, isLoading]);

  // Função para adicionar log de auditoria
  const addAuditLog = useCallback((action: AuditActionType, targetUser: User, details: string) => {
    if (!currentUser) return;
    
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actionType: action,
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      performedBy: currentUser.id,
      performedByName: currentUser.name,
      timestamp: new Date().toISOString(),
      details,
    };
    
    setAuditLogs(prev => [newLog, ...prev]);
  }, [currentUser]);

  // Verificar se usuário atual pode gerenciar
  const canManageUsers = useCallback(() => {
    if (!currentUser) return false;
    return ALLOWED_MANAGERS.includes(currentUser.email) || currentUser.profile === 'admin';
  }, [currentUser]);

  // Bloquear usuário
  const blockUser = useCallback((userId: string, reason?: string) => {
    if (!canManageUsers()) return;
    
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          status: 'bloqueado' as UserStatus,
          deactivatedAt: new Date().toISOString(),
          deactivatedBy: currentUser?.id,
        };
        addAuditLog('user_blocked', updated, reason || 'Usuário bloqueado');
        return updated;
      }
      return u;
    }));
  }, [canManageUsers, currentUser, addAuditLog]);

  // Desbloquear usuário
  const unblockUser = useCallback((userId: string) => {
    if (!canManageUsers()) return;
    
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          status: 'ativo' as UserStatus,
          deactivatedAt: undefined,
          deactivatedBy: undefined,
        };
        addAuditLog('user_unblocked', updated, 'Usuário desbloqueado');
        return updated;
      }
      return u;
    }));
  }, [canManageUsers, addAuditLog]);

  // Desativar usuário (desligamento)
  const deactivateUser = useCallback((userId: string, reason?: string) => {
    if (!canManageUsers()) return;
    
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          status: 'desligado' as UserStatus,
          deactivatedAt: new Date().toISOString(),
          deactivatedBy: currentUser?.id,
        };
        addAuditLog('user_deactivated', updated, reason || 'Usuário desligado/desativado');
        return updated;
      }
      return u;
    }));
  }, [canManageUsers, currentUser, addAuditLog]);

  // Reativar usuário
  const reactivateUser = useCallback((userId: string) => {
    if (!canManageUsers()) return;
    
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          status: 'ativo' as UserStatus,
          deactivatedAt: undefined,
          deactivatedBy: undefined,
        };
        addAuditLog('user_activated', updated, 'Usuário reativado');
        return updated;
      }
      return u;
    }));
  }, [canManageUsers, addAuditLog]);

  // Excluir usuário (soft delete - marca como inativo)
  const deleteUser = useCallback((userId: string) => {
    if (!canManageUsers()) return;
    
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          status: 'inativo' as UserStatus,
          deactivatedAt: new Date().toISOString(),
          deactivatedBy: currentUser?.id,
        };
        addAuditLog('user_deleted', updated, 'Usuário excluído (soft delete)');
        return updated;
      }
      return u;
    }));
  }, [canManageUsers, currentUser, addAuditLog]);

  // Atualizar perfil do usuário
  const updateUserRole = useCallback((userId: string, newRole: UserProfile) => {
    if (!canManageUsers()) return;
    
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, profile: newRole };
        addAuditLog('role_changed', updated, `Perfil alterado para: ${newRole}`);
        return updated;
      }
      return u;
    }));
  }, [canManageUsers, addAuditLog]);

  // Resetar senha
  const resetUserPassword = useCallback((userId: string) => {
    if (!canManageUsers()) return;
    
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      addAuditLog('password_reset', targetUser, 'Senha resetada pelo administrador');
    }
  }, [canManageUsers, users, addAuditLog]);

  // Filtros
  const getUsersByStatus = useCallback((status: UserStatus) => {
    return users.filter(u => u.status === status);
  }, [users]);

  const getUsersByDirectorate = useCallback((directorate: string) => {
    return users.filter(u => u.diretoria?.toLowerCase().includes(directorate.toLowerCase()));
  }, [users]);

  const searchUsers = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery) ||
      u.cargo?.toLowerCase().includes(lowerQuery) ||
      u.diretoria?.toLowerCase().includes(lowerQuery)
    );
  }, [users]);

  // Auditoria
  const getAuditLogs = useCallback((targetUserId?: string) => {
    if (targetUserId) {
      return auditLogs.filter(log => log.targetUserId === targetUserId);
    }
    return auditLogs;
  }, [auditLogs]);

  return (
    <UserManagementContext.Provider
      value={{
        users,
        auditLogs,
        isLoading,
        blockUser,
        unblockUser,
        deactivateUser,
        reactivateUser,
        deleteUser,
        updateUserRole,
        resetUserPassword,
        getUsersByStatus,
        getUsersByDirectorate,
        searchUsers,
        getAuditLogs,
        canManageUsers,
      }}
    >
      {children}
    </UserManagementContext.Provider>
  );
}

export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
}
