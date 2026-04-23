/**
 * Addvalu Chat Interface - Versão Inteligente
 * Componente de chat conectado aos dados reais do sistema
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  Trash2,
  ChevronDown,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { addvaluAI, AIResponse } from './addvalu-intelligence';
import { useAuth } from '@/features/auth/auth-context';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestedActions?: string[];
}

export function AddvaluChat() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Escutar evento global para abrir o chat
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('open-addvalu-chat', handleOpenChat);
    return () => window.removeEventListener('open-addvalu-chat', handleOpenChat);
  }, []);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Mensagem de boas-vindas inteligente
  useEffect(() => {
    if (messages.length === 0 && user) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
      
      const welcomeMsg: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `${greeting}${user?.name ? ', ' + user.name.split(' ')[0] : ''}. Sou a Addvalu, analista operacional do NIE. Estou conectada aos dados do sistema e posso ajudar com informações sobre projetos, análises de status ou insights sobre a operação.`,
        timestamp: Date.now(),
        suggestedActions: [
          'Quais projetos estão ativos?',
          'Me dê um resumo geral',
          'Tem algum risco crítico?'
        ]
      };
      setMessages([welcomeMsg]);
    }
  }, [user]);

  const handleSend = async (e?: React.FormEvent, quickMessage?: string) => {
    e?.preventDefault();
    const messageText = quickMessage || input;
    
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await addvaluAI.processMessage(messageText, user || undefined);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        suggestedActions: response.suggestedActions
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Erro Addvalu:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Tive um problema ao processar sua solicitação. Pode tentar novamente?',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setIsOpen(false);
  };

  // Renderizar conteúdo da mensagem com formatação
  const renderMessageContent = (content: string) => {
    // Processar negrito
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[420px] h-[580px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-[#0055A4] p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden relative bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Addvalu</h3>
                  <p className="text-[10px] text-white/70 mt-1 uppercase tracking-wider font-medium">Analista Operacional NIE</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/20">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "flex-row"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[#0055A4] flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm shadow-sm whitespace-pre-line",
                      msg.role === 'user' 
                        ? "bg-[#F47920] text-white rounded-tr-none" 
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none"
                    )}>
                      {renderMessageContent(msg.content)}
                    </div>
                    
                    {/* Ações sugeridas */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(undefined, action)}
                            className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[#0055A4] hover:bg-[#0055A4]/5 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0055A4] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer / Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte sobre projetos, status ou análises..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0055A4] transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-[#0055A4] text-white p-2.5 rounded-xl hover:bg-[#004488] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => handleSend(undefined, 'Resumo executivo')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0055A4]/10 text-[#0055A4] rounded-full text-xs font-medium hover:bg-[#0055A4]/20 transition-colors whitespace-nowrap"
                >
                  <BarChart3 className="w-3 h-3" />
                  Resumo
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(undefined, 'Projetos ativos')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 transition-colors whitespace-nowrap"
                >
                  <CheckCircle className="w-3 h-3" />
                  Ativos
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(undefined, 'Análise de riscos')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors whitespace-nowrap"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Riscos
                </button>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] text-gray-400">Addvalu IA - Dados em tempo real</p>
                <button 
                  type="button"
                  onClick={clearChat}
                  className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Limpar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <div className="flex items-center gap-3">
        {isMinimized && isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsMinimized(false)}
            className="bg-[#0055A4] text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 font-medium text-sm hover:scale-105 transition-all"
          >
            <Bot className="w-4 h-4" />
            Addvalu aberta
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isOpen && isMinimized) {
              setIsMinimized(false);
            } else {
              setIsOpen(!isOpen);
            }
          }}
          className={cn(
            "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
            isOpen ? "bg-[#F47920] rotate-0" : "bg-[#0055A4] hover:bg-[#004488]"
          )}
        >
          {isOpen && !isMinimized ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative w-10 h-10 flex items-center justify-center">
               <Sparkles className="w-6 h-6 text-white" />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }} 
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute -top-1 -right-1 w-3 h-3 bg-[#00A651] border-2 border-[#0055A4] rounded-full z-10" 
               />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
