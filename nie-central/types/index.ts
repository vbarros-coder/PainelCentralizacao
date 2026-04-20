/**
 * Types - Central de Projetos NIE
 * Tipagem forte para todo o sistema
 */

// ============================================
// AUTHENTICATION
// ============================================

export type UserProfile = 
  | 'master_admin' 
  | 'admin' 
  | 'executivo' 
  | 'diretoria' 
  | 'coordenacao' 
  | 'usuario_restrito'
  | 'usuario'; // Compatibilidade

export type UserStatus = 'ativo' | 'pendente' | 'inativo';

export interface User {
  id: string;
  email: string;
  name: string;
  profile: UserProfile;
  diretoria?: string; 
  cargo?: string;
  status: UserStatus;
  isNew?: boolean; // Para destaque administrativo
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number; // Timestamp
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// PROJECTS
// ============================================

export type ProjectCategory = 
  | 'estrategia' 
  | 'operacional' 
  | 'tecnologia' 
  | 'financeiro' 
  | 'rh' 
  | 'marketing' 
  | 'juridico';

export type ProjectStatus = 
  | 'ativo' 
  | 'pausado' 
  | 'concluido' 
  | 'cancelado' 
  | 'planejamento';

export interface Project {
  id: string;
  nome: string;
  descricao: string;
  categoria: ProjectCategory;
  status: ProjectStatus;
  diretoria: string;
  responsavel: string;
  link: string;
  destaque: boolean;
  favorito: boolean;
  createdAt: string;
  updatedAt: string;
  progresso?: number; // 0-100
  dataInicio?: string;
  dataFim?: string;
  equipe?: string[];
}

export interface ProjectFilters {
  search: string;
  categoria: ProjectCategory | 'all';
  status: ProjectStatus | 'all';
  diretoria: string | 'all';
  apenasFavoritos: boolean;
  apenasDestaque: boolean;
}

export type ProjectSortBy = 'nome' | 'data' | 'status' | 'categoria' | 'destaque';

export interface ProjectSort {
  by: ProjectSortBy;
  direction: 'asc' | 'desc';
}

// ============================================
// UI COMPONENTS
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  requiredProfile?: UserProfile[];
}

// ============================================
// LGPD & PRIVACY
// ============================================

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export interface UserDataRequest {
  type: 'view' | 'delete' | 'export' | 'rectify';
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
}

// ============================================
// API & DATA
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ============================================
// ANIMATION
// ============================================

export interface AnimationConfig {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
}

export type AnimationVariant = 
  | 'fadeIn' 
  | 'slideUp' 
  | 'slideDown' 
  | 'scale' 
  | 'stagger';
