/**
 * UI Components - Design System Addvalora
 */

'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// BUTTON
// ============================================

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

const buttonVariants = {
  primary: 'bg-[#0055A4] text-white hover:bg-[#004a8c]',
  secondary: 'bg-[#00A651] text-white hover:bg-[#008c44]',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  danger: 'bg-[#F47920] text-white hover:bg-[#d66818]',
  outline: 'bg-transparent border-2 border-[#0055A4] text-[#0055A4] hover:bg-[#0055A4] hover:text-white',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'w-10 h-10 p-0',
};

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </motion.button>
  );
}

// ============================================
// CARD
// ============================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  isHoverable?: boolean;
}

export function Card({ children, className, isHoverable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border',
        'shadow-sm text-foreground',
        isHoverable && 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================
// BADGE
// ============================================

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const badgeVariants = {
  default: 'bg-[#0055A4]/10 text-[#0055A4] border-[#0055A4]/20',
  success: 'bg-[#00A651]/10 text-[#00A651] border-[#00A651]/20',
  warning: 'bg-[#F47920]/10 text-[#F47920] border-[#F47920]/20',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-[#0055A4]/10 text-[#0055A4] border-[#0055A4]/20',
};

export function Badge({ children, className, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ============================================
// AVATAR
// ============================================

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center text-white font-semibold shrink-0',
        'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        !src && 'bg-gradient-to-br from-[#0055A4] to-[#00A651]',
        avatarSizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// ============================================
// SKELETON
// ============================================

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md',
        className
      )}
    />
  );
}

// ============================================
// INPUT
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            'w-full rounded-lg border bg-white dark:bg-gray-900',
            'text-gray-900 dark:text-gray-100 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-[#0055A4] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            'px-4 py-2.5',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
