/**
 * Login Page
 * Página de autenticação com design Addvalora
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/features/auth/auth-context';
import { cn, sanitizeInput, isValidEmail } from '@/lib/utils';
import { CURRENT_YEAR } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    if (!sanitizedEmail || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!isValidEmail(sanitizedEmail)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({
        email: sanitizedEmail,
        password,
        rememberMe: false,
      });

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Erro ao fazer login.');
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 relative animate-pulse">
            <Image
              src="/logo-addvalora.png"
              alt="Addvalora"
              fill
              className="object-contain"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-48 h-16 relative">
              <Image
                src="/logo-addvalora.png"
                alt="Addvalora Global Loss Adjusters"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Central de Projetos NIE
            </h1>
            <p className="text-gray-500 text-sm">
              Acesso restrito a usuários autorizados
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@addvaloraglobal.com"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border bg-white',
                    'text-gray-900 placeholder:text-gray-400',
                    'focus:outline-none focus:border-[#F47920]',
                    'transition-all duration-200',
                    error ? 'border-red-300' : 'border-gray-300'
                  )}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border bg-white',
                    'text-gray-900 placeholder:text-gray-400',
                    'focus:outline-none focus:border-[#F47920]',
                    'transition-all duration-200',
                    error ? 'border-red-300' : 'border-gray-300'
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button - Laranja Addvalora */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-semibold text-white',
                'bg-[#F47920] hover:bg-[#d66818]',
                'focus:outline-none',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Registro Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Não tem uma conta?{' '}
              <Link href="/registro" className="text-[#F47920] font-semibold hover:underline">
                Solicitar acesso
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200" />

          {/* Footer */}
          <div className="text-center space-y-3">
            <p className="text-xs text-gray-500">
              © {CURRENT_YEAR} Addvalora Global Loss Adjusters
            </p>
            <p className="text-xs text-gray-400">
              Todos os direitos reservados
            </p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <a href="#" className="text-gray-500 hover:text-[#F47920] transition-colors">
                Política de Privacidade
              </a>
              <span className="text-gray-300">|</span>
              <a href="#" className="text-gray-500 hover:text-[#F47920] transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
