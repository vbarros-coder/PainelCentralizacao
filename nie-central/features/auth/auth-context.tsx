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
import { User, AuthSession, LoginCredentials, AuthState, UserProfile, UserStatus } from '@/types';
import { MOCK_USERS, MOCK_PASSWORDS } from '@/lib/mock-data';
import { generateId, isClient } from '@/lib/utils';

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
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  checkPermission: (requiredProfiles: UserProfile[]) => boolean;
  canAccessProject: (projectDiretoria: string) => boolean;
  updateUser: (updates: Partial<User>) => void;
  getAllUsers: () => User[];
  updateUserAdmin: (userId: string, updates: Partial<User>) => void;
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

  // Inicializar "Banco de Dados" simulado
  useEffect(() => {
    if (!isClient()) return;
    
    const storedUsers = localStorage.getItem(USERS_DB_KEY);
    const storedPasswords = localStorage.getItem('nie_passwords_db_v1');
    
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
  }, []);

  // Carregar sessão do localStorage no mount
  useEffect(() => {
    if (!isClient()) return;

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      const userPrefs = localStorage.getItem(USER_PREFERENCES_KEY);
      const preferences = userPrefs ? JSON.parse(userPrefs) : {};

      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        
        // Aplicar preferências persistentes (como avatar) se existirem para este usuário
        if (session.user && preferences[session.user.email]) {
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

    // Buscar usuário
    const user = usersDb.find((u) => u.email.toLowerCase() === email);
    
    if (!user) {
      incrementLoginAttempt(email);
      return { success: false, error: 'Credenciais inválidas' };
    }

    if (user.status === 'pendente') {
      return { success: false, error: 'Seu cadastro está em análise pela administração.' };
    }

    if (user.status === 'inativo') {
      return { success: false, error: 'Sua conta está desativada. Entre em contato com o suporte.' };
    }

    // Carregar preferências persistentes
    let persistedUser = { ...user };
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

    return { success: true };
  }, [usersDb, passwordsDb]);

  // ============================================
  // LOGOUT
  // ============================================

  const logout = useCallback(() => {
    if (isClient()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
  }, []);

  // ============================================
  // PERMISSIONS
  // ============================================

  const checkPermission = useCallback((requiredProfiles: UserProfile[]): boolean => {
    if (!state.user) return false;
    
    // Master admin tem todas as permissões
    if (state.user.profile === 'master_admin') return true;
    
    // Admin tem quase todas, exceto algumas de master (se houver)
    if (state.user.profile === 'admin' && requiredProfiles.includes('admin')) return true;

    return requiredProfiles.includes(state.user.profile);
  }, [state.user]);

  const canAccessProject = useCallback((projectDiretoria: string): boolean => {
    if (!state.user) return false;
    
    // Master admin e Admin acesso total
    if (['master_admin', 'admin', 'executivo'].includes(state.user.profile)) return true;
    
    // Diretor acesso à sua diretoria
    if (state.user.profile === 'diretoria' || state.user.profile === 'coordenacao') {
      return state.user.diretoria === projectDiretoria;
    }
    
    // Usuário restrito pode ter lógica adicional aqui
    if (state.user.profile === 'usuario_restrito') {
       // Por exemplo, apenas projetos que ele é responsável ou equipe
       return false; // Implementação base
    }

    return true;
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
    const AUTHORIZED_EMAILS = [
      'admin@addvalora.com',
      'wfernandez@addvaloraglobal.com',
      'lhey@addvaloraglobal.com'
    ];

    if (!state.user || !AUTHORIZED_EMAILS.includes(state.user.email.toLowerCase())) {
      console.warn('Usuário não autorizado a realizar esta ação administrativa.');
      return;
    }

    const newUsersDb = usersDb.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    
    setUsersDb(newUsersDb);
    
    if (isClient()) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(newUsersDb));
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
  }, [usersDb, state.user]);

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
    canAccessProject,
    updateUser,
    getAllUsers,
    updateUserAdmin,
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
