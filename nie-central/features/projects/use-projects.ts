/**
 * Projects Hook
 * Gerenciamento de estado dos projetos com destaques personalizados
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Project, ProjectFilters, ProjectSort } from '@/types';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { isClient } from '@/lib/utils';

import { useAuth } from '@/features/auth/auth-context';

const FAVORITES_STORAGE_KEY = 'nie_project_favorites';
const USER_DESTAQUES_STORAGE_KEY = 'nie_user_destaques';

export function useProjects() {
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
    const storedDestaques = localStorage.getItem(`${USER_DESTAQUES_STORAGE_KEY}_${user?.id || 'guest'}`);
    let destaques: string[] = [];
    if (storedDestaques) {
      try {
        destaques = JSON.parse(storedDestaques);
        setUserDestaques(destaques);
      } catch {
        destaques = [];
      }
    }
    
    // Merge project destaques with user destaques
    setProjects(accessibleProjects.map((p) => ({
      ...p,
      favorito: favorites.includes(p.id),
      destaque: p.destaque || destaques.includes(p.id), // Combine admin destaque with user destaque
    })));
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, [canAccessProject, user?.profile, user?.diretoria, user?.id]);

  // Save favorites to localStorage
  const saveFavorites = useCallback((projectId: string, isFavorite: boolean) => {
    if (!isClient()) return;
    
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    let favorites: string[] = [];
    
    if (stored) {
      try {
        favorites = JSON.parse(stored);
      } catch {
        favorites = [];
      }
    }
    
    if (isFavorite) {
      favorites.push(projectId);
    } else {
      favorites = favorites.filter((id) => id !== projectId);
    }
    
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((projectId: string) => {
    setProjects((prev) => {
      const project = prev.find((p) => p.id === projectId);
      if (project) {
        saveFavorites(projectId, !project.favorito);
      }
      return prev.map((p) =>
        p.id === projectId ? { ...p, favorito: !p.favorito } : p
      );
    });
  }, [saveFavorites]);

  // Toggle user destaque (personal highlight)
  const toggleUserDestaque = useCallback((projectId: string) => {
    if (!user?.id) return;
    
    setUserDestaques((prev) => {
      const newDestaques = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId];
      
      // Save to localStorage
      localStorage.setItem(
        `${USER_DESTAQUES_STORAGE_KEY}_${user.id}`,
        JSON.stringify(newDestaques)
      );
      
      return newDestaques;
    });
    
    // Update projects
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, destaque: !p.destaque } : p
      )
    );
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

  // Featured projects (combines admin and user destaques)
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

  return {
    projects,
    filteredProjects,
    featuredProjects,
    userDestaques,
    filters,
    setFilters,
    sort,
    setSort,
    toggleFavorite,
    toggleUserDestaque,
    isLoading,
    stats,
  };
}
