/**
 * Presence Context
 * Sistema de presença de usuários estilo Discord
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserPresenceStatus } from '@/types';
import { isClient } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type PresenceStatus = 'available' | 'away' | 'busy' | 'offline';

interface PresenceState {
  manualStatus: PresenceStatus | null;
  effectiveStatus: PresenceStatus;
  lastActivityAt: number;
  lastSeen: number;
}

interface PresenceContextType extends PresenceState {
  setManualStatus: (status: PresenceStatus | null) => void;
  updateActivity: () => void;
  getStatusColor: () => string;
  getStatusLabel: () => string;
  getTimeAgo: () => string;
  isAutoStatus: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const AWAY_TIMEOUT = 5 * 60 * 1000; // 5 minutos
const OFFLINE_TIMEOUT = 15 * 60 * 1000; // 15 minutos
const HEARTBEAT_INTERVAL = 30 * 1000; // 30 segundos

const PRESENCE_STORAGE_KEY = 'nie_presence_status';

// ============================================
// CONTEXT
// ============================================

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PresenceState>({
    manualStatus: null,
    effectiveStatus: 'available',
    lastActivityAt: Date.now(),
    lastSeen: Date.now(),
  });

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Carregar status manual do localStorage
  useEffect(() => {
    if (!isClient()) return;
    
    const stored = localStorage.getItem(PRESENCE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          manualStatus: parsed.manualStatus || null,
        }));
      } catch {
        // Ignora erro
      }
    }
  }, []);

  // Salvar status manual no localStorage
  useEffect(() => {
    if (!isClient()) return;
    
    localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify({
      manualStatus: state.manualStatus,
    }));
  }, [state.manualStatus]);

  // Calcular status efetivo
  const calculateEffectiveStatus = useCallback((): PresenceStatus => {
    const now = Date.now();
    const timeSinceActivity = now - state.lastActivityAt;

    // Se tem status manual ocupado, sempre mostra ocupado
    if (state.manualStatus === 'busy') return 'busy';
    
    // Se tem status manual ausente, respeita
    if (state.manualStatus === 'away') return 'away';
    
    // Se tem status manual disponível, verifica atividade
    if (state.manualStatus === 'available') {
      if (timeSinceActivity > OFFLINE_TIMEOUT) return 'offline';
      if (timeSinceActivity > AWAY_TIMEOUT) return 'away';
      return 'available';
    }

    // Automático: baseado na atividade
    if (timeSinceActivity > OFFLINE_TIMEOUT) return 'offline';
    if (timeSinceActivity > AWAY_TIMEOUT) return 'away';
    return 'available';
  }, [state.manualStatus, state.lastActivityAt]);

  // Atualizar status efetivo periodicamente
  useEffect(() => {
    const updateEffectiveStatus = () => {
      const effective = calculateEffectiveStatus();
      setState(prev => {
        if (prev.effectiveStatus !== effective) {
          return { ...prev, effectiveStatus: effective };
        }
        return prev;
      });
    };

    // Atualiza imediatamente
    updateEffectiveStatus();

    // E a cada 10 segundos
    const interval = setInterval(updateEffectiveStatus, 10000);
    return () => clearInterval(interval);
  }, [calculateEffectiveStatus]);

  // Heartbeat
  useEffect(() => {
    if (!isClient()) return;

    const heartbeat = () => {
      if (isActiveRef.current) {
        setState(prev => ({
          ...prev,
          lastSeen: Date.now(),
        }));
      }
    };

    heartbeatRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL);
    
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, []);

  // Detectar atividade do usuário
  useEffect(() => {
    if (!isClient()) return;

    const events = ['mousedown', 'keydown', 'mousemove', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      isActiveRef.current = true;
      setState(prev => ({
        ...prev,
        lastActivityAt: Date.now(),
        effectiveStatus: prev.manualStatus === 'busy' ? 'busy' : 'available',
      }));
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
      } else {
        handleActivity();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Definir status manual
  const setManualStatus = useCallback((status: PresenceStatus | null) => {
    setState(prev => ({
      ...prev,
      manualStatus: status,
      effectiveStatus: status || prev.effectiveStatus,
    }));
  }, []);

  // Atualizar atividade manualmente
  const updateActivity = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastActivityAt: Date.now(),
    }));
  }, []);

  // Obter cor do status
  const getStatusColor = useCallback(() => {
    switch (state.effectiveStatus) {
      case 'available': return '#00A651'; // Verde
      case 'away': return '#F47920'; // Laranja/Amarelo
      case 'busy': return '#ef4444'; // Vermelho
      case 'offline': return '#9ca3af'; // Cinza
      default: return '#9ca3af';
    }
  }, [state.effectiveStatus]);

  // Obter label do status
  const getStatusLabel = useCallback(() => {
    switch (state.effectiveStatus) {
      case 'available': return 'Disponível';
      case 'away': return 'Ausente';
      case 'busy': return 'Ocupado';
      case 'offline': return 'Offline';
      default: return 'Offline';
    }
  }, [state.effectiveStatus]);

  // Calcular tempo atrás
  const getTimeAgo = useCallback(() => {
    const now = Date.now();
    const diff = now - state.lastActivityAt;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `há ${minutes} min`;
    if (hours < 24) return `há ${hours}h`;
    return `há ${Math.floor(hours / 24)}d`;
  }, [state.lastActivityAt]);

  const isAutoStatus = state.manualStatus === null;

  const value: PresenceContextType = {
    ...state,
    setManualStatus,
    updateActivity,
    getStatusColor,
    getStatusLabel,
    getTimeAgo,
    isAutoStatus,
  };

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function usePresence() {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresence deve ser usado dentro de PresenceProvider');
  }
  return context;
}
