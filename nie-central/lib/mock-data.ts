/**
 * Mock Data - Central de Projetos NIE
 * Dados simulados para desenvolvimento frontend
 */

import { User, Project, UserProfile } from '@/types';

// ============================================
// ANO ATUAL DINÂMICO
// ============================================

export const CURRENT_YEAR = new Date().getFullYear();
export const NEXT_YEAR = CURRENT_YEAR + 1;

// ============================================
// USERS (Mock Database)
// ============================================

export const MOCK_USERS: User[] = [
  // Master Admin
  {
    id: 'usr-000',
    email: 'master@addvalora.com',
    name: 'Administrador Master',
    profile: 'master_admin',
    status: 'ativo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master',
    createdAt: `${CURRENT_YEAR}-01-01T10:00:00Z`,
    lastLogin: new Date().toISOString(),
  },
  // Admin
  {
    id: 'usr-001',
    email: 'admin@addvalora.com',
    name: 'Administrador NIE',
    profile: 'admin',
    status: 'ativo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: `${CURRENT_YEAR}-01-15T10:00:00Z`,
    lastLogin: new Date().toISOString(),
  },
  // CEOs / Executivos
  {
    id: 'usr-ceo-1',
    email: 'lhey@addvaloraglobal.com',
    name: 'Lhey',
    profile: 'executivo',
    status: 'ativo',
    cargo: 'CEO',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lhey',
    createdAt: `${CURRENT_YEAR}-01-01T00:00:00Z`,
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr-ceo-2',
    email: 'wfernandez@addvaloraglobal.com',
    name: 'W. Fernandez',
    profile: 'executivo',
    status: 'ativo',
    cargo: 'CEO',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wfernandez',
    createdAt: `${CURRENT_YEAR}-01-01T00:00:00Z`,
    lastLogin: new Date().toISOString(),
  },
  // Diretores por Diretoria
  {
    id: 'usr-dir-1',
    email: 'diretor.property@addvalora.com',
    name: 'Paulo Cardoso',
    profile: 'diretoria',
    status: 'ativo',
    diretoria: 'Property / Construção',
    cargo: 'Diretor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=paulo',
    createdAt: `${CURRENT_YEAR}-01-20T14:30:00Z`,
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr-dir-2',
    email: 'diretor.transportes@addvalora.com',
    name: 'Clark Pellegrino',
    profile: 'diretoria',
    status: 'ativo',
    diretoria: 'Property / Transportes / Mecânica / Elétrica',
    cargo: 'Diretor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=clark',
    createdAt: `${CURRENT_YEAR}-01-20T14:30:00Z`,
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr-dir-3',
    email: 'diretor.garantia@addvalora.com',
    name: 'Rebeca Hicko',
    profile: 'diretoria',
    status: 'ativo',
    diretoria: 'Garantia / Fiança / Riscos',
    cargo: 'Diretora',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rebeca',
    createdAt: `${CURRENT_YEAR}-01-20T14:30:00Z`,
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr-dir-4',
    email: 'diretor.rcg@addvalora.com',
    name: 'Alex Guagliardi',
    profile: 'diretoria',
    status: 'ativo',
    diretoria: 'Responsabilidade Civil Geral (RCG)',
    cargo: 'Diretor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    createdAt: `${CURRENT_YEAR}-01-20T14:30:00Z`,
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr-dir-5',
    email: 'diretor.rcp@addvalora.com',
    name: 'Everton Voleck',
    profile: 'diretoria',
    status: 'ativo',
    diretoria: 'Responsabilidade Civil Profissional (RCP)',
    cargo: 'Diretor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=everton',
    createdAt: `${CURRENT_YEAR}-01-20T14:30:00Z`,
    lastLogin: new Date().toISOString(),
  },
  // Usuário comum
  {
    id: 'usr-003',
    email: 'usuario@addvalora.com',
    name: 'João Silva',
    profile: 'usuario',
    status: 'ativo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    createdAt: `${CURRENT_YEAR}-03-10T11:00:00Z`,
    lastLogin: new Date().toISOString(),
  },
];

// Senhas mock (em produção seria hash)
export const MOCK_PASSWORDS: Record<string, string> = {
  'master@addvalora.com': 'Master@2026',
  'admin@addvalora.com': 'Admin@2026',
  'lhey@addvaloraglobal.com': 'CEO@2026',
  'wfernandez@addvaloraglobal.com': 'CEO@2026',
  'diretor.property@addvalora.com': 'Diretor@2026',
  'diretor.transportes@addvalora.com': 'Diretor@2026',
  'diretor.garantia@addvalora.com': 'Diretor@2026',
  'diretor.rcg@addvalora.com': 'Diretor@2026',
  'diretor.rcp@addvalora.com': 'Diretor@2026',
  'usuario@addvalora.com': 'Usuario@2026',
};

// ============================================
// PROJECTS - Apenas com links reais
// ============================================

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    nome: 'Painel de Controle de Prazos',
    descricao: 'Sistema de gestão e monitoramento de prazos processuais e administrativos com alertas automáticos e dashboard intuitivo.',
    categoria: 'tecnologia',
    status: 'ativo',
    diretoria: 'Property / Construção',
    responsavel: 'Equipe NIE',
    link: 'https://nie-prazos.pages.dev/',
    destaque: true,
    favorito: false,
    progresso: 100,
    dataInicio: `${CURRENT_YEAR}-01-01`,
    dataFim: `${CURRENT_YEAR}-12-31`,
    createdAt: `${CURRENT_YEAR}-01-01T00:00:00Z`,
    updatedAt: `${CURRENT_YEAR}-12-15T10:00:00Z`,
  },
  {
    id: 'proj-002',
    nome: 'Painel de Acionamentos',
    descricao: 'Plataforma de gerenciamento de acionamentos e demandas internas com acompanhamento em tempo real e relatórios gerenciais.',
    categoria: 'operacional',
    status: 'ativo',
    diretoria: 'Property / Transportes / Mecânica / Elétrica',
    responsavel: 'Equipe NIE',
    link: 'https://painel.nie-inteligencia.com',
    destaque: true,
    favorito: false,
    progresso: 100,
    dataInicio: `${CURRENT_YEAR}-01-01`,
    dataFim: `${CURRENT_YEAR}-12-31`,
    createdAt: `${CURRENT_YEAR}-01-01T00:00:00Z`,
    updatedAt: `${CURRENT_YEAR}-12-15T10:00:00Z`,
  },
  {
    id: 'proj-003',
    nome: 'Módulos de Treinamento - Instituto Addvalora',
    descricao: 'Plataforma de ensino digital com módulos de treinamento, avaliações e certificação para capacitação profissional.',
    categoria: 'rh',
    status: 'ativo',
    diretoria: 'Garantia / Fiança / Riscos',
    responsavel: 'Instituto Addvalora',
    link: 'https://instituto-addvalora-nie.vercel.app/',
    destaque: true,
    favorito: false,
    progresso: 100,
    dataInicio: `${CURRENT_YEAR}-01-01`,
    dataFim: `${CURRENT_YEAR}-12-31`,
    createdAt: `${CURRENT_YEAR}-01-01T00:00:00Z`,
    updatedAt: `${CURRENT_YEAR}-12-15T10:00:00Z`,
  },
  {
    id: 'proj-004',
    nome: 'SLAs - Service Level Agreements',
    descricao: 'Sistema de monitoramento e gestão de Acordos de Nível de Serviço com indicadores de performance e relatórios automatizados.',
    categoria: 'operacional',
    status: 'ativo',
    diretoria: 'Responsabilidade Civil Geral (RCG)',
    responsavel: 'Equipe NIE',
    link: 'https://projeto-nieteste.vercel.app/',
    destaque: true,
    favorito: false,
    progresso: 100,
    dataInicio: `${CURRENT_YEAR}-01-01`,
    dataFim: `${CURRENT_YEAR}-12-31`,
    createdAt: `${CURRENT_YEAR}-01-01T00:00:00Z`,
    updatedAt: `${CURRENT_YEAR}-12-15T10:00:00Z`,
  },
];

// ============================================
// DIRETORIAS - Atualizadas conforme imagem
// ============================================

export const DIRETORIAS = [
  'Property / Construção — Paulo Cardoso',
  'Property / Transportes / Mecânica / Elétrica — Clark Pellegrino',
  'Garantia / Fiança / Riscos — Rebeca Hicko',
  'Responsabilidade Civil Geral (RCG) — Alex Guagliardi',
  'Responsabilidade Civil Profissional (RCP) — Everton Voleck',
] as const;

// ============================================
// CATEGORY LABELS
// ============================================

export const CATEGORY_LABELS: Record<string, string> = {
  estrategia: 'Estratégia',
  operacional: 'Operacional',
  tecnologia: 'Tecnologia',
  financeiro: 'Financeiro',
  rh: 'Recursos Humanos',
  marketing: 'Marketing',
  juridico: 'Jurídico',
};

export const STATUS_LABELS: Record<string, string> = {
  ativo: 'Ativo',
  pausado: 'Pausado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  planejamento: 'Em Planejamento',
};

export const PROFILE_LABELS: Record<string, string> = {
  master_admin: 'Master Admin',
  admin: 'Administrador',
  executivo: 'Executivo',
  diretoria: 'Diretoria',
  coordenacao: 'Coordenação',
  usuario_restrito: 'Usuário Restrito',
  usuario: 'Usuário',
};
