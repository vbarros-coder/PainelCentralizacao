/**
 * Design System - Central de Projetos NIE
 * Tokens semânticos - Identidade Visual Addvalora
 * 
 * Cores principais Addvalora:
 * - Verde: #00A651 (cor primária)
 * - Azul: #0055A4 (cor secundária)
 * - Laranja: #F47920 (cor de destaque)
 */

export const colors = {
  // Brand Addvalora - Azul (Primária)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#0055A4', // Azul Addvalora
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Brand Addvalora - Verde (Secundária)
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#00A651', // Verde Addvalora
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  // Brand Addvalora - Laranja (Destaque)
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#F47920', // Laranja Addvalora
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  
  // Semantic
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#00A651', // Verde Addvalora
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#F47920', // Laranja Addvalora
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutral
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Dark mode
  dark: {
    bg: '#0a0a0f',
    surface: '#13131f',
    elevated: '#1c1c2e',
    border: '#2a2a3e',
  }
} as const;

// Cores Addvalora para uso direto
export const addvaloraColors = {
  green: '#00A651',
  blue: '#0055A4',
  orange: '#F47920',
  darkGreen: '#008c44',
  darkBlue: '#004a8c',
  darkOrange: '#d66818',
} as const;

export const spacing = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

export const typography = {
  fontFamily: {
    sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
    mono: ['var(--font-geist-mono)', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
  premium: '0 4px 20px -2px rgb(0 0 0 / 0.1), 0 8px 40px -4px rgb(0 0 0 / 0.08)',
  'premium-lg': '0 8px 30px -4px rgb(0 0 0 / 0.12), 0 16px 60px -8px rgb(0 0 0 / 0.08)',
  glow: '0 0 40px -10px rgb(0 85 164 / 0.3)', // Glow azul Addvalora
} as const;

export const radii = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const transitions = {
  DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Category colors atualizados com identidade Addvalora (Azul e Laranja)
export const categoryColors = {
  estrategia: { bg: 'bg-blue-50', text: 'text-[#0055A4]', border: 'border-blue-200', dark: { bg: 'dark:bg-blue-950/30', text: 'dark:text-blue-300', border: 'dark:border-blue-800' } },
  operacional: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dark: { bg: 'dark:bg-slate-950/30', text: 'dark:text-slate-300', border: 'dark:border-slate-800' } },
  tecnologia: { bg: 'bg-blue-50', text: 'text-[#0055A4]', border: 'border-blue-200', dark: { bg: 'dark:bg-blue-950/30', text: 'dark:text-blue-300', border: 'dark:border-blue-800' } },
  financeiro: { bg: 'bg-orange-50', text: 'text-[#F47920]', border: 'border-orange-200', dark: { bg: 'dark:bg-orange-950/30', text: 'dark:text-orange-300', border: 'dark:border-orange-800' } },
  rh: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dark: { bg: 'dark:bg-rose-950/30', text: 'dark:text-rose-300', border: 'dark:border-rose-800' } },
  marketing: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dark: { bg: 'dark:bg-amber-950/30', text: 'dark:text-amber-300', border: 'dark:border-amber-800' } },
  juridico: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dark: { bg: 'dark:bg-indigo-950/30', text: 'dark:text-indigo-300', border: 'dark:border-indigo-800' } },
} as const;

// Status colors atualizados - Addvalora Azul e Laranja
export const statusColors = {
  ativo: { bg: 'bg-blue-50', text: 'text-[#0055A4]', border: 'border-blue-200', dot: 'bg-[#0055A4]', dark: { bg: 'dark:bg-blue-950/30', text: 'dark:text-blue-300', border: 'dark:border-blue-800', dot: 'dark:bg-blue-400' } },
  pausado: { bg: 'bg-orange-50', text: 'text-[#F47920]', border: 'border-orange-200', dot: 'bg-[#F47920]', dark: { bg: 'dark:bg-orange-950/30', text: 'dark:text-orange-300', border: 'dark:border-orange-800', dot: 'dark:bg-orange-400' } },
  concluido: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500', dark: { bg: 'dark:bg-slate-950/30', text: 'dark:text-slate-300', border: 'dark:border-slate-800', dot: 'dark:bg-slate-400' } },
  cancelado: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', dark: { bg: 'dark:bg-red-950/30', text: 'dark:text-red-300', border: 'dark:border-red-800', dot: 'dark:bg-red-400' } },
  planejamento: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', dark: { bg: 'dark:bg-amber-950/30', text: 'dark:text-amber-300', border: 'dark:border-amber-800', dot: 'dark:bg-amber-400' } },
} as const;

// Profile colors atualizados
export const profileColors = {
  admin: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dark: { bg: 'dark:bg-orange-950/30', text: 'dark:text-orange-300', border: 'dark:border-orange-800' } },
  diretor: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dark: { bg: 'dark:bg-blue-950/30', text: 'dark:text-blue-300', border: 'dark:border-blue-800' } },
  usuario: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dark: { bg: 'dark:bg-emerald-950/30', text: 'dark:text-emerald-300', border: 'dark:border-emerald-800' } },
} as const;
