/**
 * Projects Hook
 * Gerenciamento de estado dos projetos
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Project, ProjectFilters, ProjectSort } from '@/types';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { isClient } from '@/lib/utils';

const FAVORITES_STORAGE_KEY = 'nie_project_favorites';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
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

  // Load favorites from localStorage
  useEffect(() => {
    if (!isClient()) return;
    
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      try {
        const favorites: string[] = JSON.parse(stored);
        setProjects((prev) =>
          prev.map((p) => ({
            ...p,
            favorito: favorites.includes(p.id),
          }))
        );
      } catch {
        // Ignore parse errors
      }
    }
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

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

  return {
    projects,
    filteredProjects,
    featuredProjects,
    filters,
    setFilters,
    sort,
    setSort,
    toggleFavorite,
    isLoading,
    stats,
  };
}
