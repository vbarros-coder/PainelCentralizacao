/**
 * Configurações Page
 * Página de configurações do usuário com upload de foto
 */

'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Moon, Sun, Mail, Camera, Upload } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { Card, Button, Avatar } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { cn } from '@/lib/utils';

function ConfiguracoesContent() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });
  const [previewImage, setPreviewImage] = useState(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useState(() => setMounted(true));

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Criar preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        // Atualizar avatar do usuário
        updateUser({ avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
003e
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalize sua experiência na Central NIE
          </p>
        </motion.div>

        {/* Perfil com Upload de Foto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar com upload */}
              <div className="relative group">
                <div 
                  className="relative cursor-pointer"
                  onClick={handleImageClick}
                >
                  <Avatar
                    src={previewImage}
                    name={user?.name}
                    size="xl"
                  />
                  
                  {/* Overlay de upload */}
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <button
                  onClick={handleImageClick}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00A651] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#008c44] transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                <p className="text-sm text-[#00A651] mt-1">
                  {user?.profile === 'admin' && 'Administrador'}
                  {user?.profile === 'diretor' && 'Diretor'}
                  {user?.profile === 'usuario' && 'Usuário'}
                </p>
                
                <p className="text-xs text-gray-400 mt-2">
                  Clique na foto para alterar
                </p>
              </div>

              <Button variant="outline" size="sm">
                Editar Perfil
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Aparência */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#00A651]/10 flex items-center justify-center">
                {mounted && resolvedTheme === 'dark' ? (
                  <Moon className="w-5 h-5 text-[#00A651]" />
                ) : (
                  <Sun className="w-5 h-5 text-[#00A651]" />
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Aparência</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Escolha o tema da interface</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  resolvedTheme === 'light'
                    ? 'border-[#00A651] bg-[#00A651]/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <Sun className="w-6 h-6 mb-2 text-[#F47920]" />
                <p className="font-medium text-gray-900 dark:text-white">Claro</p>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  resolvedTheme === 'dark'
                    ? 'border-[#00A651] bg-[#00A651]/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <Moon className="w-6 h-6 mb-2 text-[#0055A4]" />
                <p className="font-medium text-gray-900 dark:text-white">Escuro</p>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Notificações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#0055A4]/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#0055A4]" />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure suas preferências</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'email', label: 'Notificações por email', icon: Mail },
                { key: 'push', label: 'Notificações push', icon: Bell },
                { key: 'updates', label: 'Atualizações do sistema', icon: Shield },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  
                  <button
                    onClick={() => setNotifications(prev => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof prev]
                    }))}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      notifications[item.key as keyof typeof notifications]
                        ? 'bg-[#00A651]'
                        : 'bg-gray-300 dark:bg-gray-700'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                        notifications[item.key as keyof typeof notifications]
                          ? 'translate-x-7'
                          : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <ProtectedRoute>
      <ConfiguracoesContent />
    </ProtectedRoute>
  );
}
