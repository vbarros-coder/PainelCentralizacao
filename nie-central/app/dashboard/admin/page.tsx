/**
 * Admin Page
 * Página de administração
 */

'use client';

import { motion } from 'framer-motion';
import { Shield, Users, Settings, Key, Database, Activity } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { Card, Button } from '@/components/ui';
import { MOCK_USERS } from '@/lib/mock-data';

function AdminContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F47920]/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#F47920]" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Administração
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerenciamento do sistema
              </p>
            </div>
          </div>
        </motion.div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              title: 'Usuários', 
              desc: `${MOCK_USERS.length} usuários cadastrados`, 
              icon: Users, 
              color: '#00A651',
              action: 'Gerenciar'
            },
            { 
              title: 'Permissões', 
              desc: 'Configurar acessos', 
              icon: Key, 
              color: '#0055A4',
              action: 'Configurar'
            },
            { 
              title: 'Configurações', 
              desc: 'Ajustes do sistema', 
              icon: Settings, 
              color: '#F47920',
              action: 'Ajustar'
            },
            { 
              title: 'Logs', 
              desc: 'Auditoria de ações', 
              icon: Activity, 
              color: '#00A651',
              action: 'Visualizar'
            },
            { 
              title: 'Backup', 
              desc: 'Backup de dados', 
              icon: Database, 
              color: '#0055A4',
              action: 'Executar'
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-1">
                  {item.desc}
                </p>

                <Button variant="outline" size="sm" className="w-full">
                  {item.action}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredProfiles={['admin']}>
      <AdminContent />
    </ProtectedRoute>
  );
}
