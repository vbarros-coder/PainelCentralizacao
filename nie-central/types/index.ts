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

export type UserStatus = 'ativo' | 'pendente' | 'inativo' | 'bloqueado' | 'desligado';

// ============================================
// AUDIT LOG
// ============================================

export type AuditActionType = 
  | 'user_created'
  | 'user_updated'
  | 'user_blocked'
  | 'user_unblocked'
  | 'user_activated'
  | 'user_deactivated'
  | 'user_deleted'
  | 'password_reset'
  | 'role_changed';

export interface AuditLog {
  id: string;
  actionType: AuditActionType;
  targetUserId: string;
  targetUserName: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

// ============================================
// PRESENCE & STATUS
// ============================================

export type UserPresenceStatus = 'available' | 'away' | 'busy' | 'offline';

export interface UserPresence {
  status: UserPresenceStatus;
  manualStatus: UserPresenceStatus | null;
  lastActive: number; // timestamp
}

// Tipos de cargo hierárquicos
export type UserRole = 
  | 'adm-nie'
  | 'executivo-luciana' 
  | 'executivo-william'
  | 'diretor'
  | 'coordenacao'
  | 'operacional'
  | 'visualizador';

export interface User {
  id: string;
  email: string;
  name: string;
  profile: UserProfile;
  role: UserRole;
  requestedRoles?: UserRole[]; // Cargos solicitados pelo usuário
  diretoria?: string; // Diretoria principal do usuário
  coordenacao?: string; // Coordenação/equipe específica
  cargo?: string; // Cargo descritivo (ex: "Diretor Garantia", "Coordenação Garantia 1")
  status: UserStatus;
  isNew?: boolean;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  presence?: UserPresence;
  // Permissões explícitas
  allowedDirectorates?: string[]; // Diretorias adicionais permitidas
  allowedCoordinations?: string[]; // Coordenações adicionais permitidas
  allowedProjects?: string[]; // Projetos específicos permitidos
  allowedPanels?: string[]; // Painéis específicos permitidos
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

export type ProjectType = 'painel' | 'projeto';

export interface Project {
  id: string;
  nome: string;
  descricao: string;
  categoria: ProjectCategory;
  status: ProjectStatus;
  tipo: ProjectType;
  diretoria: string;
  coordenacao?: string; // Coordenação responsável
  responsavel: string;
  responsibleUserId?: string; // ID do usuário responsável
  link: string;
  destaque: boolean;
  favorito: boolean;
  createdAt: string;
  updatedAt: string;
  dataInicio?: string;
  dataFim?: string;
  equipe?: string[];
  allowedUsers?: string[]; // Usuários específicos com acesso
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
