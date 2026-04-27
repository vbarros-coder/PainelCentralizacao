/**
 * Projects Context
 * Provedor de estado global para os projetos da Central NIE
 */

'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Project, ProjectFilters, ProjectSort } from '@/types';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { isClient } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';

const FAVORITES_STORAGE_KEY = 'nie_project_favorites';
const USER_DESTAQUES_STORAGE_KEY = 'nie_user_destaques';

interface ProjectsContextType {
  projects: Project[];
  filteredProjects: Project[];
  featuredProjects: Project[];
  userDestaques: string[];
  filters: ProjectFilters;
  setFilters: (filters: ProjectFilters) => void;
  sort: ProjectSort;
  setSort: (sort: ProjectSort) => void;
  toggleFavorite: (projectId: string) => void;
  toggleHighlight: (projectId: string) => void;
  isLoading: boolean;
  stats: {
    total: number;
    ativos: number;
    concluidos: number;
    favoritos: number;
  };
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { canAccessProject, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [userDestaques, setUserDestaques] = useState<string[]>([]);
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    categoria: 'all',
    status: 'all',
    diretoria: 'all',
    apenasFavoritos: false,
    apenasDestaque: false,
  });
  const [sort, setSort] = useState<ProjectSort>({
    by: 'destaque',
    direction: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites, user destaques and filter by access
  useEffect(() => {
    if (!isClient()) return;
    
    // Aplicar restrição de acesso por diretoria/RBAC
    const accessibleProjects = MOCK_PROJECTS.filter(p => canAccessProject(p.diretoria));
    
    // Load favorites
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    let favorites: string[] = [];
    if (storedFavorites) {
      try {
        favorites = JSON.parse(storedFavorites);
      } catch {
        favorites = [];
      }
    }
    
    // Load user personal destaques
    const storageKey = `${USER_DESTAQUES_STORAGE_KEY}_${user?.id || 'guest'}`;
    const storedDestaques = localStorage.getItem(storageKey);
    let destaques: string[] = [];
    if (storedDestaques) {
      try {
        destaques = JSON.parse(storedDestaques);
        setUserDestaques(destaques);
      } catch {
        destaques = [];
      }
    }
    
    // Merge project favorites and destaques
    setProjects(accessibleProjects.map((p) => ({
      ...p,
      favorito: favorites.includes(p.id),
      destaque: p.destaque || destaques.includes(p.id), // Combine admin destaque with user destaque
    })));
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, [canAccessProject, user?.id]);

  // Toggle favorite
  const toggleFavorite = useCallback((projectId: string) => {
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id === projectId) {
          const newFavorite = !p.favorito;
          
          if (isClient()) {
            const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
            let favorites: string[] = [];
            if (stored) {
              try {
                favorites = JSON.parse(stored);
              } catch {
                favorites = [];
              }
            }
            
            if (newFavorite) {
              if (!favorites.includes(projectId)) favorites.push(projectId);
            } else {
              favorites = favorites.filter((id) => id !== projectId);
            }
            
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
          }

          return { ...p, favorito: newFavorite };
        }
        return p;
      });
      return updated;
    });
  }, []);

  // Toggle destaque (highlight)
  const toggleHighlight = useCallback((projectId: string) => {
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id === projectId) {
          const newDestaque = !p.destaque;
          
          if (isClient()) {
            const storageKey = `${USER_DESTAQUES_STORAGE_KEY}_${user?.id || 'guest'}`;
            const stored = localStorage.getItem(storageKey);
            let destaques: string[] = [];
            if (stored) {
              try {
                destaques = JSON.parse(stored);
              } catch {
                destaques = [];
              }
            }
            
            if (newDestaque) {
              if (!destaques.includes(projectId)) destaques.push(projectId);
            } else {
              destaques = destaques.filter((id) => id !== projectId);
            }
            
            localStorage.setItem(storageKey, JSON.stringify(destaques));
            setUserDestaques(destaques);
          }

          return { ...p, destaque: newDestaque };
        }
        return p;
      });
      return updated;
    });
  }, [user?.id]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nome.toLowerCase().includes(searchLower) ||
          p.descricao.toLowerCase().includes(searchLower) ||
          p.responsavel.toLowerCase().includes(searchLower)
      );
    }

    if (filters.categoria !== 'all') {
      result = result.filter((p) => p.categoria === filters.categoria);
    }

    if (filters.status !== 'all') {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.diretoria !== 'all') {
      result = result.filter((p) => p.diretoria === filters.diretoria);
    }

    if (filters.apenasFavoritos) {
      result = result.filter((p) => p.favorito);
    }

    if (filters.apenasDestaque) {
      result = result.filter((p) => p.destaque);
    }

    // Apply sorting
    result.sort((a, b) => {
      // Prioridade 1: Ativo primeiro
      if (a.status === 'ativo' && b.status !== 'ativo') return -1;
      if (a.status !== 'ativo' && b.status === 'ativo') return 1;

      // Prioridade 2: Destaque
      if (a.destaque && !b.destaque) return -1;
      if (!a.destaque && b.destaque) return 1;

      let comparison = 0;

      switch (sort.by) {
        case 'nome':
          comparison = a.nome.localeCompare(b.nome);
          break;
        case 'data':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'categoria':
          comparison = a.categoria.localeCompare(b.categoria);
          break;
        case 'destaque':
          comparison = Number(b.destaque) - Number(a.destaque);
          break;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [projects, filters, sort]);

  // Featured projects
  const featuredProjects = useMemo(() => {
    return projects.filter((p) => p.destaque);
  }, [projects]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: projects.length,
      ativos: projects.filter((p) => p.status === 'ativo').length,
      concluidos: projects.filter((p) => p.status === 'concluido').length,
      favoritos: projects.filter((p) => p.favorito).length,
    };
  }, [projects]);

  const value = useMemo(() => ({
    projects,
    filteredProjects,
    featuredProjects,
    userDestaques,
    filters,
    setFilters,
    sort,
    setSort,
    toggleFavorite,
    toggleHighlight,
    isLoading,
    stats,
  }), [
    projects,
    filteredProjects,
    featuredProjects,
    userDestaques,
    filters,
    sort,
    toggleFavorite,
    toggleHighlight,
    isLoading,
    stats
  ]);

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjectsContext() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider');
  }
  return context;
}
