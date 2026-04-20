/**
 * Registro Page
 * Página de cadastro de novos usuários com design Addvalora
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Building,
  Briefcase,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/features/auth/auth-context';
import { cn, sanitizeInput, isValidEmail } from '@/lib/utils';
import { CURRENT_YEAR } from '@/lib/mock-data';

const DIRETORIAS = [
  'Property / Construção',
  'Property / Transportes / Mecânica / Elétrica',
  'Garantia / Fiança / Riscos',
  'Responsabilidade Civil Geral (RCG)',
  'Responsabilidade Civil Profissional (RCP)',
  'Outros'
];

export default function RegistroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [diretoria, setDiretoria] = useState('');
  const [cargo, setCargo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    if (!name || !sanitizedEmail || !password || !diretoria || !cargo) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!isValidEmail(sanitizedEmail)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name,
        email: sanitizedEmail,
        password,
        diretoria,
        cargo,
        profile: 'usuario'
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.error || 'Erro ao realizar cadastro.');
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitação Enviada!</h1>
          <p className="text-gray-600 mb-6">
            Seu cadastro foi realizado com sucesso e está pendente de aprovação pela administração.
          </p>
          <p className="text-sm text-gray-500">Redirecionando para a tela de login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Back to login */}
          <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#F47920] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Voltar para login
          </Link>

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
              Solicitar Acesso
            </h1>
            <p className="text-gray-500 text-sm">
              Preencha os dados abaixo para solicitar sua conta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className={cn(
                    'w-full pl-10 pr-4 py-2 rounded-lg border bg-white',
                    'text-gray-900 placeholder:text-gray-400',
                    'focus:outline-none focus:border-[#F47920]',
                    'transition-all duration-200',
                    error ? 'border-red-300' : 'border-gray-300'
                  )}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Corporativo
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@addvaloraglobal.com"
                  className={cn(
                    'w-full pl-10 pr-4 py-2 rounded-lg border bg-white',
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full px-4 py-2 rounded-lg border bg-white',
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
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Diretoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diretoria / Área
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Building className="w-4 h-4" />
                </div>
                <select
                  value={diretoria}
                  onChange={(e) => setDiretoria(e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-2 rounded-lg border bg-white appearance-none',
                    'text-gray-900',
                    'focus:outline-none focus:border-[#F47920]',
                    'transition-all duration-200',
                    error ? 'border-red-300' : 'border-gray-300'
                  )}
                  disabled={isLoading}
                >
                  <option value="">Selecione uma diretoria</option>
                  {DIRETORIAS.map((dir) => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Seu cargo"
                  className={cn(
                    'w-full pl-10 pr-4 py-2 rounded-lg border bg-white',
                    'text-gray-900 placeholder:text-gray-400',
                    'focus:outline-none focus:border-[#F47920]',
                    'transition-all duration-200',
                    error ? 'border-red-300' : 'border-gray-300'
                  )}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-semibold text-white mt-4',
                'bg-[#F47920] hover:bg-[#d66818]',
                'focus:outline-none',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? 'Enviando...' : 'Solicitar Cadastro'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              © {CURRENT_YEAR} Addvalora Global Loss Adjusters
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
