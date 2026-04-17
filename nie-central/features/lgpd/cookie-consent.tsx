'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Cookie, FileText, Eye, Trash2, Download } from 'lucide-react';
import { isClient } from '@/lib/utils';
import { Button, Badge } from '@/components/ui';

const CONSENT_KEY = 'nie_lgpd_consent_v1';

interface ConsentData {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (!isClient()) return;
    
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setShowBanner(true);
    } else {
      try {
        const data: ConsentData = JSON.parse(stored);
        setPreferences({
          essential: data.essential,
          analytics: data.analytics,
          marketing: data.marketing,
        });
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const consent: ConsentData = {
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    
    if (isClient()) {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    }
    
    setShowBanner(false);
  };

  const acceptAll = () => {
    setPreferences({ essential: true, analytics: true, marketing: true });
    saveConsent(true, true);
  };

  const acceptSelected = () => {
    saveConsent(preferences.analytics, preferences.marketing);
  };

  const rejectAll = () => {
    setPreferences({ essential: true, analytics: false, marketing: false });
    saveConsent(false, false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6">
            {!showDetails ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Cookie className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Configuração de Cookies
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Utilizamos cookies para melhorar sua experiência. Os cookies essenciais 
                    são necessários para o funcionamento do site.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={rejectAll}>
                    Rejeitar
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowDetails(true)}>
                    Personalizar
                  </Button>
                  <Button size="sm" onClick={acceptAll}>
                    Aceitar Todos
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Preferências de Cookies
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={preferences.essential}
                      disabled
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Essenciais</span>
                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded">
                          Obrigatório
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Necessários para o funcionamento básico do site.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Análise</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Nos ajudam a entender como você usa o site.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({ ...preferences, marketing: e.target.checked })
                      }
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Marketing</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Utilizados para personalizar sua experiência.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={rejectAll}>
                    Rejeitar Todos
                  </Button>
                  <Button size="sm" onClick={acceptSelected}>
                    Salvar Preferências
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PrivacySettings() {
  const [showPanel, setShowPanel] = useState(false);

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      message: 'Seus dados serão processados e enviados em até 15 dias.',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solicitacao-dados-nie.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Shield className="w-4 h-4" />
        Privacidade (LGPD)
      </button>

      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Privacidade</h2>
                      <p className="text-sm text-gray-500">LGPD</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium">Visualizar Dados</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Veja todos os dados que temos sobre você.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Meus Dados
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Download className="w-5 h-5 text-green-600" />
                      <h3 className="font-medium">Exportar Dados</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Baixe uma cópia dos seus dados em formato JSON.
                    </p>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleExportData}>
                      Solicitar Exportação
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Trash2 className="w-5 h-5 text-red-600" />
                      <h3 className="font-medium">Excluir Dados</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Solicite a exclusão completa dos seus dados.
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                      Solicitar Exclusão
                    </Button>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
                    <h3 className="font-medium mb-2">Sobre a LGPD</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Em conformidade com a Lei nº 13.709/2018 (LGPD), 
                      garantimos seus direitos de acesso, correção, 
                      exclusão e portabilidade dos dados.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
