/**
 * Equipe Page
 * Página de equipe
 */

'use client';

import { motion } from 'framer-motion';
import { Users, Mail, Shield, User } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { Card, Avatar } from '@/components/ui';
import { MOCK_USERS, PROFILE_LABELS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

function EquipeContent() {
  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Equipe
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Colaboradores da Central NIE
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_USERS.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className={cn(
                        'text-[11px] font-bold px-2 py-0.5 rounded-full uppercase',
                        user.profile === 'master_admin' && 'bg-red-100 text-red-600',
                        user.profile === 'admin' && 'bg-[#F47920]/10 text-[#F47920]',
                        user.profile === 'executivo' && 'bg-blue-100 text-blue-600',
                        user.profile === 'diretoria' && 'bg-indigo-100 text-indigo-600',
                        user.profile === 'usuario' && 'bg-green-100 text-green-600'
                      )}>
                        {PROFILE_LABELS[user.profile]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>

                    {user.diretoria && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <Shield className="w-4 h-4" />
                        {user.diretoria}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EquipePage() {
  return (
    <ProtectedRoute>
      <EquipeContent />
    </ProtectedRoute>
  );
}
