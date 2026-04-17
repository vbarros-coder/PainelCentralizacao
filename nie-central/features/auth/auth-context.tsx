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
import { User, AuthSession, LoginCredentials, AuthState, UserProfile } from '@/types';
import { MOCK_USERS, MOCK_PASSWORDS } from '@/lib/mock-data';
import { generateId, isClient } from '@/lib/utils';

// ============================================
// CONSTANTS
// ============================================

const AUTH_STORAGE_KEY = 'nie_auth_session_v1';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

// ============================================
// TYPES
// ============================================

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkPermission: (requiredProfiles: UserProfile[]) => boolean;
  canAccessProject: (projectDiretoria: string) => boolean;
  updateUser: (updates: Partial<User>) => void;
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

  // Carregar sessão do localStorage no mount
  useEffect(() => {
    if (!isClient()) return;

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        
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
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email);
    
    if (!user) {
      incrementLoginAttempt(email);
      return { success: false, error: 'Credenciais inválidas' };
    }

    // Verificar senha (mock)
    const storedPassword = MOCK_PASSWORDS[email];
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
        ...user,
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
  }, [loginAttempts]);

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
    return requiredProfiles.includes(state.user.profile);
  }, [state.user]);

  const canAccessProject = useCallback((projectDiretoria: string): boolean => {
    if (!state.user) return false;
    
    // Admin acesso total
    if (state.user.profile === 'admin') return true;
    
    // Diretor acesso à sua diretoria
    if (state.user.profile === 'diretor') {
      return state.user.diretoria === projectDiretoria;
    }
    
    // Usuário acesso restrito (apenas projetos ativos/concluídos)
    return true;
  }, [state.user]);

  // ============================================
  // UPDATE USER
  // ============================================

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...updates };
    setState((prev) => ({ ...prev, user: updatedUser }));

    // Atualizar localStorage
    if (isClient()) {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        session.user = updatedUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      }
    }
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
    checkPermission,
    canAccessProject,
    updateUser,
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
