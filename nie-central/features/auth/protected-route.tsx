/**
 * Protected Route Guard
 * Componente para proteger rotas que requerem autenticação
 * Com identidade visual Addvalora
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { UserProfile } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredProfiles?: UserProfile[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredProfiles,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, checkPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (requiredProfiles && !checkPermission(requiredProfiles)) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router, requiredProfiles, checkPermission]);

  // Loading state com imagotipo Addvalora
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            {/* Imagem do imagotipo Addvalora */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-24 h-24 relative"
            >
              <Image
                src="/imagotipo-addvalora.png"
                alt="Addvalora"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
            <div className="absolute -bottom-2 -right-2">
              <Loader2 className="w-6 h-6 text-[#00A651] animate-spin" />
            </div>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-600 dark:text-gray-400 font-medium"
          >
            Verificando autenticação...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Não autenticado ou sem permissão
  if (!isAuthenticated || (requiredProfiles && !checkPermission(requiredProfiles))) {
    return fallback || null;
  }

  return <>{children}</>;
}
