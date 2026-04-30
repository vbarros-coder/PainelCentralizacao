/**
 * Admin Page
 * Página de administração
 */

'use client';

import { motion } from 'framer-motion';
import { Shield, Users, Settings, Key, Database, Activity, Search, X, Download, ShieldCheck, UserCheck, AlertCircle, Info } from 'lucide-react';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { Card, Button, Avatar, Badge } from '@/components/ui';
import { MOCK_USERS, PROFILE_LABELS } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';

function AdminContent() {
  const router = useRouter();
  const { getAllUsers, isGlobalAdmin, getLogs, performBackup, updateUserAdmin, logAction } = useAuth();
  const { showToast } = useToast();
  const [executing, setExecuting] = useState<string | null>(null);
  
  // Modal states
  const [showPermissions, setShowPermissions] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  // Data
  const allUsers = getAllUsers();
  const logs = getLogs();
  const globalAdmin = isGlobalAdmin();

  const handleAction = async (item: any) => {
    if (item.title === 'Usuários') {
      router.push('/dashboard/admin/usuarios');
      return;
    } 
    
    if (item.title === 'Configurações') {
      router.push('/dashboard/configuracoes');
      return;
    }

    if (!globalAdmin && ['Permissões', 'Logs', 'Backup'].includes(item.title)) {
      showToast('Acesso negado. Apenas administradores autorizados.', 'error');
      return;
    }

    if (item.title === 'Permissões') {
      setShowPermissions(true);
    } else if (item.title === 'Logs') {
      setShowLogs(true);
    } else if (item.title === 'Backup') {
      setShowBackup(true);
    }
  };

  // Admin Cards
  const adminItems = useMemo(() => {
    // Contar apenas usuários pendentes como "novos" (não removidos, não ativos)
    const newUsersCount = allUsers.filter(u => u.status === 'pendente').length;
    
    const items = [
      { 
        title: 'Usuários', 
        desc: `${allUsers.length} usuários cadastrados`, 
        icon: Users, 
        color: '#00A651',
        action: 'Gerenciar',
        badge: newUsersCount > 0 ? `${newUsersCount} novos` : null,
        restricted: false
      },
      { 
        title: 'Permissões', 
        desc: 'Configurar acessos e perfis', 
        icon: Key, 
        color: '#0055A4',
        action: 'Configurar',
        restricted: true
      },
      { 
        title: 'Configurações', 
        desc: 'Ajustes gerais do sistema', 
        icon: Settings, 
        color: '#F47920',
        action: 'Ajustar',
        restricted: false
      },
      { 
        title: 'Logs', 
        desc: `${logs.length} eventos registrados`, 
        icon: Activity, 
        color: '#00A651',
        action: 'Visualizar',
        restricted: true
      },
      { 
        title: 'Backup', 
        desc: 'Backup de segurança dos dados', 
        icon: Database, 
        color: '#0055A4',
        action: 'Executar',
        restricted: true
      },
    ];

    // Se não for super admin, remove os itens restritos
    return items.filter(item => !item.restricted || globalAdmin);
  }, [allUsers, globalAdmin, logs]);

  // Modal Components
  const Modal = ({ title, isOpen, onClose, children, icon: Icon, color }: any) => (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-transparent p-6">
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
                Gerenciamento do sistema {globalAdmin && <span className="text-[#0055A4] font-semibold">• Acesso Master</span>}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full flex flex-col relative overflow-hidden">
                {item.badge && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                      {item.badge}
                    </div>
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  {item.restricted && (
                    <Badge variant="info" size="sm" className="bg-[#0055A4]/10 text-[#0055A4] border-none">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Restrito
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-1">
                  {item.desc}
                </p>

                <Button 
                  variant={item.restricted ? "primary" : "outline"}
                  size="sm" 
                  className={cn(
                    "w-full transition-all duration-300 font-bold",
                    item.restricted 
                      ? "bg-[#0055A4] hover:bg-[#004488] text-white border-transparent" 
                      : "text-[#0055A4] border-[#0055A4] hover:bg-[#0055A4]/5"
                  )}
                  isLoading={executing === item.title}
                  onClick={() => handleAction(item)}
                >
                  {item.action}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Permissions Modal */}
      <Modal 
        title="Gerenciar Permissões" 
        isOpen={showPermissions} 
        onClose={() => setShowPermissions(false)}
        icon={Key}
        color="#0055A4"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-800">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Altere os perfis de acesso dos usuários. As mudanças são aplicadas imediatamente após salvar.
            </p>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {allUsers.map((user) => (
              <div key={user.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0055A4]"
                    value={user.profile}
                    onChange={(e) => {
                      updateUserAdmin(user.id, { profile: e.target.value as any });
                      showToast(`Perfil de ${user.name} atualizado para ${PROFILE_LABELS[e.target.value as keyof typeof PROFILE_LABELS]}`, 'success');
                    }}
                  >
                    {Object.entries(PROFILE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Logs Modal */}
      <Modal 
        title="Logs de Auditoria" 
        isOpen={showLogs} 
        onClose={() => setShowLogs(false)}
        icon={Activity}
        color="#00A651"
      >
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum log registrado ainda.</p>
            </div>
          ) : (
            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Data/Hora</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Usuário</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Ação</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Categoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{log.user}</span>
                          <span className="text-[10px] text-gray-400">{log.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{log.action}</td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={log.category === 'AUTH' ? 'info' : log.category === 'ADMIN' ? 'warning' : 'success'} 
                          size="sm"
                        >
                          {log.category}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Backup Modal */}
      <Modal 
        title="Backup de Dados" 
        isOpen={showBackup} 
        onClose={() => setShowBackup(false)}
        icon={Database}
        color="#0055A4"
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#0055A4]/10 flex items-center justify-center mb-6">
            <Database className="w-10 h-10 text-[#0055A4]" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Geração de Backup de Segurança
          </h4>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
            Isso irá gerar um arquivo compactado contendo todos os usuários, permissões, configurações e logs do sistema.
          </p>

          <div className="w-full max-w-sm space-y-4">
            <Button 
              className="w-full bg-[#0055A4] hover:bg-[#004488]" 
              isLoading={executing === 'Backup'}
              onClick={async () => {
                setExecuting('Backup');
                const result = await performBackup();
                setExecuting(null);
                if (result.success) {
                  showToast(`Backup concluído com sucesso em ${result.date}`, 'success');
                } else {
                  showToast('Erro ao realizar backup. Tente novamente.', 'error');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Iniciar Backup Agora
            </Button>
            
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Último backup: {logs.find(l => l.category === 'BACKUP')?.timestamp ? new Date(logs.find(l => l.category === 'BACKUP').timestamp).toLocaleString('pt-BR') : 'Nunca realizado'}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminPage() {
  const { isGlobalAdmin, checkPermission } = useAuth();
  
  // Automação: Bloqueio automático para quem não é ADM NIE ou Admin nominal
  const hasAccess = isGlobalAdmin() || checkPermission(['admin']);

  return (
    <ProtectedRoute requiredProfiles={['master_admin', 'admin']}>
      {hasAccess ? (
        <AdminContent />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="p-8 max-w-md text-center">
            <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Acesso Negado</h2>
            <p className="text-gray-500">Esta área é restrita à Alta Administração autorizada.</p>
          </Card>
        </div>
      )}
    </ProtectedRoute>
  );
}
