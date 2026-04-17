'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronDown,
  Star,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { cn, debounce } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { ProjectFilters, ProjectSort, ProjectCategory, ProjectStatus } from '@/types';
import { CATEGORY_LABELS, STATUS_LABELS, DIRETORIAS } from '@/lib/mock-data';

interface ProjectFiltersProps {
  filters: ProjectFilters;
  sort: ProjectSort;
  onFilterChange: (filters: ProjectFilters) => void;
  onSortChange: (sort: ProjectSort) => void;
  resultCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const categories: { value: ProjectCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas Categorias' },
  { value: 'estrategia', label: 'Estratégia' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'juridico', label: 'Jurídico' },
];

const statuses: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos Status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'planejamento', label: 'Planejamento' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

const sortOptions: { value: ProjectSort['by']; label: string }[] = [
  { value: 'nome', label: 'Nome' },
  { value: 'data', label: 'Data' },
  { value: 'status', label: 'Status' },
  { value: 'categoria', label: 'Categoria' },
  { value: 'destaque', label: 'Destaque' },
];

export function ProjectFiltersComponent({
  filters,
  sort,
  onFilterChange,
  onSortChange,
  resultCount,
  viewMode,
  onViewModeChange,
}: ProjectFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onFilterChange({ ...filters, search: value });
    }, 300),
    [filters, onFilterChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const clearFilters = () => {
    setSearchValue('');
    onFilterChange({
      search: '',
      categoria: 'all',
      status: 'all',
      diretoria: 'all',
      apenasFavoritos: false,
      apenasDestaque: false,
    });
  };

  const hasActiveFilters =
    filters.categoria !== 'all' ||
    filters.status !== 'all' ||
    filters.diretoria !== 'all' ||
    filters.apenasFavoritos ||
    filters.apenasDestaque ||
    filters.search;

  const activeFiltersCount = [
    filters.categoria !== 'all',
    filters.status !== 'all',
    filters.diretoria !== 'all',
    filters.apenasFavoritos,
    filters.apenasDestaque,
    filters.search,
  ].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchValue}
              onChange={handleSearchChange}
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-lg border',
                'bg-white dark:bg-gray-900 text-gray-900 dark:text-white',
                'border-gray-300 dark:border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'placeholder:text-gray-400'
              )}
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue('');
                  onFilterChange({ ...filters, search: '' });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterChange({ ...filters, apenasFavoritos: !filters.apenasFavoritos })}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              filters.apenasFavoritos
                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'
            )}
          >
            <Star className={cn('w-4 h-4', filters.apenasFavoritos && 'fill-current')} />
            Favoritos
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterChange({ ...filters, apenasDestaque: !filters.apenasDestaque })}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              filters.apenasDestaque
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'
            )}
          >
            Destaque
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              isExpanded
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <select
              value={sort.by}
              onChange={(e) => onSortChange({ ...sort, by: e.target.value as ProjectSort['by'] })}
              className={cn(
                'appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm',
                'bg-white dark:bg-gray-900 text-gray-900 dark:text-white',
                'border-gray-300 dark:border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Ordenar: {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <select
                  value={filters.categoria}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      categoria: e.target.value as ProjectCategory | 'all',
                    })
                  }
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border text-sm',
                    'bg-white dark:bg-gray-900 text-gray-900 dark:text-white',
                    'border-gray-300 dark:border-gray-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      status: e.target.value as ProjectStatus | 'all',
                    })
                  }
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border text-sm',
                    'bg-white dark:bg-gray-900 text-gray-900 dark:text-white',
                    'border-gray-300 dark:border-gray-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diretoria
                </label>
                <select
                  value={filters.diretoria}
                  onChange={(e) => onFilterChange({ ...filters, diretoria: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border text-sm',
                    'bg-white dark:bg-gray-900 text-gray-900 dark:text-white',
                    'border-gray-300 dark:border-gray-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                >
                  <option value="all">Todas Diretorias</option>
                  {DIRETORIAS.map((dir) => (
                    <option key={dir} value={dir}>
                      {dir}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters && (
            <>
              <span className="text-sm text-gray-500">Filtros ativos:</span>

              {filters.search && (
                <Badge variant="default" size="sm" className="gap-1">
                  Busca: {filters.search}
                  <button
                    onClick={() => {
                      setSearchValue('');
                      onFilterChange({ ...filters, search: '' });
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {filters.categoria !== 'all' && (
                <Badge variant="default" size="sm" className="gap-1">
                  {CATEGORY_LABELS[filters.categoria]}
                  <button onClick={() => onFilterChange({ ...filters, categoria: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {filters.status !== 'all' && (
                <Badge variant="default" size="sm" className="gap-1">
                  {STATUS_LABELS[filters.status]}
                  <button onClick={() => onFilterChange({ ...filters, status: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {filters.diretoria !== 'all' && (
                <Badge variant="default" size="sm" className="gap-1">
                  {filters.diretoria}
                  <button onClick={() => onFilterChange({ ...filters, diretoria: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Limpar todos
              </button>
            </>
          )}
        </div>

        <span className="text-sm text-gray-500">
          {resultCount} {resultCount === 1 ? 'projeto' : 'projetos'}
        </span>
      </div>
    </motion.div>
  );
}
