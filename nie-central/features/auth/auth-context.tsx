/**
 * Auth Context - Sistema de Autenticação Frontend
 * Gerenciamento de estado de autenticação com localStorage
 * 
 * NOTA DE SEGURANÇA: Este é um sistema frontend-only para demonstração.
 * Em produção, NUNCA armazene tokens em localStorage (use httpOnly cookies).
 * As senhas mock são apenas para desenvolvimento - em produção use bcrypt/Argon2.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthSession, LoginCredentials, AuthState, UserProfile, UserStatus, UserPresenceStatus, UserRole, Project } from '@/types';
import { MOCK_USERS, MOCK_PASSWORDS } from '@/lib/mock-data';
import { generateId, isClient } from '@/lib/utils';
import { 
  isGlobalAdmin, 
  canManageUsers, 
  canAccessDirectorate, 
  canAccessCoordination,
  canViewProject,
  filterProjectsByUserAccess,
  getUserPermissionScope,
  getRoleLabel,
  PermissionScope
} from '@/lib/permissions';

// ============================================
// CONSTANTS
// ============================================

const AUTH_STORAGE_KEY = 'nie_auth_session_v1';
const USER_PREFERENCES_KEY = 'nie_user_preferences_v1';
const USERS_DB_KEY = 'nie_users_db_v1'; // Simulação de banco de dados de usuários
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

// ============================================
// TYPES
// ============================================

interface RegisterData {
  name: string;
  email: string;
  password: string;
  diretoria?: string;
  cargo?: string;
  profile?: UserProfile;
  role?: UserRole;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  checkPermission: (requiredProfiles: UserProfile[]) => boolean;
  // Permissões hierárquicas (novo sistema)
  isGlobalAdmin: () => boolean;
  canManageUsers: () => boolean;
  canAccessAdminPanel: () => boolean;
  canAccessDirectorate: (directorate: string) => boolean;
  canAccessCoordination: (coordination: string) => boolean;
  canViewProject: (project: Project) => boolean;
  filterProjectsByAccess: (projects: Project[]) => Project[];
  getPermissionScope: () => PermissionScope;
  getRoleLabel: () => string;
  // Funções legadas (manter compatibilidade)
  canAccessProject: (projectDiretoria: string) => boolean;
  canAccessReports: () => boolean;
  updateUser: (updates: Partial<User>) => void;
  getAllUsers: () => User[];
  updateUserAdmin: (userId: string, updates: Partial<User>) => void;
  logAction: (action: string, category: string, details?: string, overrideUser?: User) => void;
  getLogs: () => any[];
  performBackup: () => Promise<{ success: boolean; date: string }>;
  updateUserPresence: (status: UserPresenceStatus | null) => void;
  isLoading: boolean;
}

interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  const [loginAttempts, setLoginAttempts] = useState<Record<string, LoginAttempt>>({});
  const [usersDb, setUsersDb] = useState<User[]>([]);
  const [passwordsDb, setPasswordsDb] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<any[]>([]);

  // Constante de emails autorizados (Whitelist nominal e técnica)
  const AUTHORIZED_USERS = [
    'admin@addvalora.com',
    'admin@nie.gov.br',
    'wfernandez@addvaloraglobal.com',
    'lhey@addvaloraglobal.com',
    'luciana.hey@addvaloraglobal.com',
    'luciana.campos@addvaloraglobal.com'
  ];

  const AUTHORIZED_NAMES = [
    'ADM NIE',
    'William Fernandez',
    'Luciana de Campos Correia Hey',
    'Luciana Hey',
    'Lu Hey',
    'Lhey',
    'W. Fernandez'
  ];

  // Inicializar "Banco de Dados" simulado e Logs
  useEffect(() => {
    if (!isClient()) return;
    
    const storedUsers = localStorage.getItem(USERS_DB_KEY);
    const storedPasswords = localStorage.getItem('nie_passwords_db_v1');
    const storedLogs = localStorage.getItem('nie_logs_v1');
    
    if (storedUsers) {
      setUsersDb(JSON.parse(storedUsers));
    } else {
      // Primeira vez, popular com MOCK_USERS
      setUsersDb(MOCK_USERS);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(MOCK_USERS));
    }
    
    if (storedPasswords) {
      setPasswordsDb(JSON.parse(storedPasswords));
    } else {
      // Primeira vez, popular com MOCK_PASSWORDS
      setPasswordsDb(MOCK_PASSWORDS);
      localStorage.setItem('nie_passwords_db_v1', JSON.stringify(MOCK_PASSWORDS));
    }

    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  }, []);

  // Carregar sessão do localStorage no mount
  useEffect(() => {
    if (!isClient()) return;

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      const userPrefs = localStorage.getItem(USER_PREFERENCES_KEY);
      const preferences = userPrefs ? JSON.parse(userPrefs) : {};
      const centralStorage = localStorage.getItem('nie_central_users_v1');
      const centralUsers = centralStorage ? JSON.parse(centralStorage) : {};

      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        
        // PRIORIDADE: Buscar do armazenamento central para garantir foto atualizada
        if (session.user && centralUsers[session.user.email]) {
          session.user = { ...session.user, ...centralUsers[session.user.email] };
        }
        // Fallback para preferências se não estiver no central (cache local)
        else if (session.user && preferences[session.user.email]) {
          session.user = { ...session.user, ...preferences[session.user.email] };
        }

        // Verificar expiração
        if (session.expiresAt > Date.now()) {
          setState({
            isAuthenticated: true,
            user: session.user,
            isLoading: false,
            error: null,
          });
        } else {
          // Sessão expirada
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      // Falha ao parse - possível tampering
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Erro ao restaurar sessão',
      });
    }
  }, []);

  // Verificar expiração periodicamente
  useEffect(() => {
    if (!isClient() || !state.isAuthenticated) return;

    const interval = setInterval(() => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        if (session.expiresAt <= Date.now()) {
          logout();
        }
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  // ============================================
  // LOGIN
  // ============================================

  const login = useCallback(async (
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string }> => {
    const email = credentials.email.toLowerCase().trim();
    
    // Verificar bloqueio por tentativas
    const attempt = loginAttempts[email];
    if (attempt?.lockedUntil && attempt.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
      return {
        success: false,
        error: `Conta temporariamente bloqueada. Tente novamente em ${minutesLeft} minutos.`,
      };
    }

    // Simular delay de rede (proteção contra timing attacks)
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    // Buscar usuário no Banco de Dados simulado atualizado
    const centralStorage = isClient() ? localStorage.getItem('nie_central_users_v1') : null;
    const centralUsers = centralStorage ? JSON.parse(centralStorage) : {};
    
    let user = usersDb.find((u) => u.email.toLowerCase() === email);
    
    // Se existir no armazenamento central (com foto nova, etc), usar esse
    if (centralUsers[email]) {
      user = centralUsers[email];
    }
    
    if (!user) {
      incrementLoginAttempt(email);
      return { success: false, error: 'Credenciais inválidas' };
    }

    if (user.status === 'pendente') {
      return { success: false, error: 'Seu cadastro está em análise pela administração.' };
    }

    if (user.status === 'inativo' || user.status === 'bloqueado' || user.status === 'desligado') {
      return { success: false, error: 'Seu acesso foi desativado. Entre em contato com o administrador.' };
    }

    // Automação: Atualizar último acesso centralizado
    const updatedUserWithLogin = { ...user, lastLogin: new Date().toISOString() };
    centralUsers[email] = updatedUserWithLogin;
    localStorage.setItem('nie_central_users_v1', JSON.stringify(centralUsers));

    // Carregar preferências persistentes
    let persistedUser = { ...updatedUserWithLogin };
    if (isClient()) {
      const userPrefs = localStorage.getItem(USER_PREFERENCES_KEY);
      const preferences = userPrefs ? JSON.parse(userPrefs) : {};
      if (preferences[email]) {
        persistedUser = { ...user, ...preferences[email] };
      }
    }

    // Verificar senha (mock)
    const storedPassword = passwordsDb[email];
    if (!storedPassword || credentials.password !== storedPassword) {
      incrementLoginAttempt(email);
      return { success: false, error: 'Credenciais inválidas' };
    }

    // Login bem-sucedido - resetar tentativas
    resetLoginAttempts(email);

    // Criar sessão
    const duration = credentials.rememberMe 
      ? SESSION_DURATION_MS * 7 // 7 dias se "lembrar-me"
      : SESSION_DURATION_MS;

    const session: AuthSession = {
      user: {
        ...persistedUser,
        lastLogin: new Date().toISOString(),
      },
      token: generateId(),
      expiresAt: Date.now() + duration,
    };

    // Salvar no localStorage
    if (isClient()) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }

    setState({
      isAuthenticated: true,
      user: session.user,
      isLoading: false,
      error: null,
    });

    logAction('Login realizado', 'AUTH', undefined, session.user);

    return { success: true };
  }, [loginAttempts, usersDb, passwordsDb]);

  // ============================================
  // REGISTER
  // ============================================

  const register = useCallback(async (
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const email = data.email.toLowerCase().trim();

    if (usersDb.some(u => u.email.toLowerCase() === email)) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }

    const newUser: User = {
      id: generateId(),
      name: data.name,
      email: email,
      profile: data.profile || 'usuario',
      role: data.role || 'visualizador',
      diretoria: data.diretoria,
      cargo: data.cargo,
      status: 'pendente', // Novos usuários começam como pendentes
      isNew: true,
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.split(' ')[0]}`,
    };

    const newUsersDb = [...usersDb, newUser];
    const newPasswordsDb = { ...passwordsDb, [email]: data.password };

    setUsersDb(newUsersDb);
    setPasswordsDb(newPasswordsDb);

    if (isClient()) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(newUsersDb));
      localStorage.setItem('nie_passwords_db_v1', JSON.stringify(newPasswordsDb));
    }

    logAction('Novo cadastro realizado', 'AUTH', `Usuário: ${newUser.name} (${newUser.email})`, newUser);

    return { success: true };
  }, [usersDb, passwordsDb]);

  // ============================================
  // LOGOUT
  // ============================================

  const logout = useCallback(() => {
    logAction('Logout realizado', 'AUTH');
    if (isClient()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
  }, [state.user]);

  // ============================================
  // PERMISSIONS
  // ============================================

  const checkPermission = useCallback((requiredProfiles: UserProfile[]): boolean => {
    if (!state.user) return false;
    
    // Automação: Master Admin e Whitelist têm acesso total sempre
    if (isSuperAdmin()) return true;
    
    // Usuários comuns não acessam Admin nem Relatórios (bloqueio automático)
    if (state.user.profile === 'usuario') return false;

    return requiredProfiles.includes(state.user.profile);
  }, [state.user]);

  const canAccessReports = useCallback((): boolean => {
    if (!state.user) return false;
    
    // Automação: Master Admin e Whitelist acesso total
    if (isSuperAdmin()) return true;
    
    // Apenas Diretores, Coordenadores e Executivos acessam relatórios
    const ALLOWED_PROFILES: UserProfile[] = ['diretoria', 'coordenacao', 'executivo'];
    return ALLOWED_PROFILES.includes(state.user.profile);
  }, [state.user]);

  const canAccessProject = useCallback((projectDiretoria: string): boolean => {
    return canAccessDirectorate(state.user, projectDiretoria);
  }, [state.user]);

  // ============================================
  // UPDATE USER
  // ============================================

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...updates };
    setState((prev) => ({ ...prev, user: updatedUser }));

    // Atualizar no Banco de Dados simulado para persistência entre logins
    const newUsersDb = usersDb.map(u => 
      u.id === state.user?.id ? { ...u, ...updates } : u
    );
    setUsersDb(newUsersDb);
    
    if (isClient()) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(newUsersDb));
      
      // Atualizar sessão atual
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        session.user = updatedUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      }

      // IMPORTANTE: Persistir permanentemente no localStorage central
      // para que a foto apareça mesmo em outros navegadores (simulado)
      // ou após logout/login.
      const centralStorage = localStorage.getItem('nie_central_users_v1');
      const centralUsers = centralStorage ? JSON.parse(centralStorage) : {};
      centralUsers[updatedUser.email] = updatedUser;
      localStorage.setItem('nie_central_users_v1', JSON.stringify(centralUsers));

      // Atualizar preferências permanentes do usuário
      const userPrefs = localStorage.getItem(USER_PREFERENCES_KEY);
      const preferences = userPrefs ? JSON.parse(userPrefs) : {};
      
      const persistentFields: Partial<User> = {};
      if (updates.avatar) persistentFields.avatar = updates.avatar;
      
      if (Object.keys(persistentFields).length > 0) {
        preferences[state.user.email] = {
          ...(preferences[state.user.email] || {}),
          ...persistentFields
        };
        localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
      }
    }
  }, [state.user, usersDb]);

  // ============================================
  // ADMIN FUNCTIONS
  // ============================================

  const getAllUsers = useCallback((): User[] => {
    return usersDb;
  }, [usersDb]);

  const updateUserAdmin = useCallback((userId: string, updates: Partial<User>) => {
    // Restrição: Apenas William, Luciana ou Admin NIE podem alterar permissões (profile) ou status
    if (!isSuperAdmin()) {
      console.warn('Usuário não autorizado a realizar esta ação administrativa.');
      return;
    }

    const newUsersDb = usersDb.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    
    setUsersDb(newUsersDb);
    
    if (isClient()) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(newUsersDb));
      
      // Automação: Persistir alteração administrativa no armazenamento central
      const userToUpdate = newUsersDb.find(u => u.id === userId);
      if (userToUpdate) {
        const centralStorage = localStorage.getItem('nie_central_users_v1');
        const centralUsers = centralStorage ? JSON.parse(centralStorage) : {};
        centralUsers[userToUpdate.email] = userToUpdate;
        localStorage.setItem('nie_central_users_v1', JSON.stringify(centralUsers));
      }
    }

    // Se o usuário editado for o logado, atualizar sessão
    if (state.user?.id === userId) {
      const updatedUser = { ...state.user, ...updates };
      setState((prev) => ({ ...prev, user: updatedUser }));
      
      if (isClient()) {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const session: AuthSession = JSON.parse(stored);
          session.user = updatedUser;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        }
      }
    }

    logAction(
      `Alteração de perfil/status do usuário ID: ${userId}`,
      'ADMIN',
      `Atualização para: ${JSON.stringify(updates)}`
    );
  }, [usersDb, state.user]);

  // ============================================
  // AUDIT LOGS
  // ============================================

  const logAction = useCallback((action: string, category: string, details?: string, overrideUser?: User) => {
    const user = overrideUser || state.user;
    if (!user) return;

    const newLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      user: user.name,
      email: user.email,
      action,
      category,
      details
    };

    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100); // Manter últimos 100
      if (isClient()) {
        localStorage.setItem('nie_logs_v1', JSON.stringify(updated));
      }
      return updated;
    });
  }, [state.user]);

  const getLogs = useCallback(() => {
    return logs;
  }, [logs]);

  // ============================================
  // BACKUP
  // ============================================

  const performBackup = useCallback(async (): Promise<{ success: boolean; date: string }> => {
    if (!isSuperAdmin()) return { success: false, date: '' };

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    const date = new Date().toLocaleString('pt-BR');
    logAction('Backup de dados realizado', 'BACKUP', `Data: ${date}`);
    
    return { success: true, date };
  }, [state.user]);

  // ============================================
  // PRESENCE & STATUS
  // ============================================

  const updateUserPresence = useCallback((manualStatus: UserPresenceStatus | null) => {
    if (!state.user) return;

    const currentPresence = state.user.presence || {
      status: 'available',
      manualStatus: null,
      lastActive: Date.now()
    };

    const newPresence = {
      ...currentPresence,
      manualStatus,
      lastActive: Date.now(),
      status: manualStatus || 'available'
    };

    updateUser({ presence: newPresence });
  }, [state.user, updateUser]);

  // Efeito para atualizar status automático (away/offline)
  useEffect(() => {
    if (!state.isAuthenticated || !state.user) return;

    const interval = setInterval(() => {
      const presence = state.user?.presence;
      if (!presence || presence.manualStatus) return;

      const idleTime = Date.now() - presence.lastActive;
      let newStatus: UserPresenceStatus = 'available';

      if (idleTime > 15 * 60 * 1000) newStatus = 'offline';
      else if (idleTime > 5 * 60 * 1000) newStatus = 'away';

      if (newStatus !== presence.status) {
        updateUser({ 
          presence: { ...presence, status: newStatus } 
        });
      }
    }, 60000); // Checar a cada minuto

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.user, updateUser]);

  // Efeito para detectar atividade do usuário
  useEffect(() => {
    if (!state.isAuthenticated || !state.user) return;

    const handleActivity = () => {
      const presence = state.user?.presence;
      if (presence?.manualStatus) return; // Status manual tem prioridade

      const now = Date.now();
      // Throttle de atualização para cada 30 segundos
      if (!presence || now - presence.lastActive > 30000) {
        updateUser({
          presence: {
            status: 'available',
            manualStatus: null,
            lastActive: now
          }
        });
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [state.isAuthenticated, state.user, updateUser]);

  // ============================================
  // PERMISSÕES HIERÁRQUICAS (NOVO SISTEMA)
  // ============================================

  const isGlobalAdminFn = useCallback((): boolean => {
    return isGlobalAdmin(state.user);
  }, [state.user]);

  const canManageUsersFn = useCallback((): boolean => {
    return canManageUsers(state.user);
  }, [state.user]);

  const canAccessAdminPanelFn = useCallback((): boolean => {
    return canManageUsers(state.user);
  }, [state.user]);

  const canAccessDirectorateFn = useCallback((directorate: string): boolean => {
    return canAccessDirectorate(state.user, directorate);
  }, [state.user]);

  const canAccessCoordinationFn = useCallback((coordination: string): boolean => {
    return canAccessCoordination(state.user, coordination);
  }, [state.user]);

  const canViewProjectFn = useCallback((project: Project): boolean => {
    return canViewProject(state.user, project);
  }, [state.user]);

  const filterProjectsByAccessFn = useCallback((projects: Project[]): Project[] => {
    return filterProjectsByUserAccess(state.user, projects);
  }, [state.user]);

  const getPermissionScopeFn = useCallback((): PermissionScope => {
    return getUserPermissionScope(state.user);
  }, [state.user]);

  const getRoleLabelFn = useCallback((): string => {
    if (!state.user) return '';
    return getRoleLabel(state.user);
  }, [state.user]);

  // ============================================
  // FUNÇÕES LEGADAS (MANTER COMPATIBILIDADE)
  // ============================================

  const isSuperAdmin = useCallback((): boolean => {
    return isGlobalAdmin(state.user);
  }, [state.user]);

  // ============================================
  // HELPERS
  // ============================================

  const incrementLoginAttempt = (email: string) => {
    setLoginAttempts((prev) => {
      const current = prev[email] || { count: 0, lockedUntil: null };
      const newCount = current.count + 1;
      
      return {
        ...prev,
        [email]: {
          count: newCount,
          lockedUntil: newCount >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null,
        },
      };
    });
  };

  const resetLoginAttempts = (email: string) => {
    setLoginAttempts((prev) => ({
      ...prev,
      [email]: { count: 0, lockedUntil: null },
    }));
  };

  // ============================================
  // RENDER
  // ============================================

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    checkPermission,
    // Novas permissões hierárquicas
    isGlobalAdmin: isGlobalAdminFn,
    canManageUsers: canManageUsersFn,
    canAccessAdminPanel: canAccessAdminPanelFn,
    canAccessDirectorate: canAccessDirectorateFn,
    canAccessCoordination: canAccessCoordinationFn,
    canViewProject: canViewProjectFn,
    filterProjectsByAccess: filterProjectsByAccessFn,
    getPermissionScope: getPermissionScopeFn,
    getRoleLabel: getRoleLabelFn,
    // Funções legadas
    canAccessProject,
    canAccessReports,
    updateUser,
    getAllUsers,
    updateUserAdmin,
    logAction,
    getLogs,
    performBackup,
    updateUserPresence,
    isLoading: state.isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

export function useRequireAuth(redirectTo = '/login') {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && isClient()) {
      window.location.href = redirectTo;
    }
  }, [auth.isAuthenticated, auth.isLoading, redirectTo]);

  return auth;
}
