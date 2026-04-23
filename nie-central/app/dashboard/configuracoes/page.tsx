/**
 * Configurações Page
 * Página de configurações do usuário com upload de foto
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Moon, Sun, Mail, Camera, Upload } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { Card, Button, Avatar } from '@/components/ui';
import { UserStatusSelector } from '@/components/ui/user-status';
import { useAuth } from '@/features/auth/auth-context';
import { ProfileEditModal } from '@/features/profile/profile-edit-modal';
import { ChangePasswordModal } from '@/features/profile/change-password-modal';
import { cn } from '@/lib/utils';
import { PROFILE_LABELS } from '@/lib/mock-data';

function ConfiguracoesContent() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });
  const [previewImage, setPreviewImage] = useState(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatar) {
      setPreviewImage(user.avatar);
    }
  }, [user?.avatar]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user?.name}
                  </h2>
                  <UserStatusSelector />
                </div>
                <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                <p className="text-sm text-[#00A651] mt-1">
                  {user?.profile && PROFILE_LABELS[user.profile]}
                </p>
                
                <p className="text-xs text-gray-400 mt-2">
                  Clique na foto para alterar
                </p>
              </div>

              <Button variant="outline" size="sm" onClick={() => setIsProfileModalOpen(true)}>
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

            <div className="grid grid-cols-2 gap-4 mb-6">
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

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Modo Escuro</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alternar entre tema claro e escuro</p>
              </div>
              
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  resolvedTheme === 'dark' ? 'bg-[#00A651]' : 'bg-gray-300'
                )}
              >
                <div className={cn(
                  'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm',
                  resolvedTheme === 'dark' ? 'left-6' : 'left-0.5'
                )} />
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#0055A4]/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#0055A4]" />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie seus alertas</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { id: 'email', label: 'Alertas por Email', desc: 'Receber atualizações de projetos no email' },
                { id: 'push', label: 'Notificações Push', desc: 'Alertas em tempo real no navegador' },
                { id: 'updates', label: 'Novidades do Sistema', desc: 'Informações sobre novas funcionalidades' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                  
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative',
                      notifications[item.id as keyof typeof notifications] ? 'bg-[#0055A4]' : 'bg-gray-300'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm',
                      notifications[item.id as keyof typeof notifications] ? 'left-5.5' : 'left-0.5'
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Segurança */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6 border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Segurança</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gerenciamento de conta</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Senha de Acesso</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recomendamos trocar a senha a cada 90 dias</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(true)}>Alterar Senha</Button>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-red-600 text-sm">Encerrar Sessão</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sair de todos os dispositivos conectados</p>
                </div>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => logout()}
                >
                  Sair do Sistema
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modais */}
      <ProfileEditModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
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
