/**
 * Addvalu Chat - Copiloto Executivo
 * Interface do chat com a analista executiva virtual
 */

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/features/auth/auth-context';
import { useProjects } from '@/features/projects/use-projects';
import { Avatar } from '@/components/ui';
import {
  runExecutiveCopilot,
  formatResponseForDisplay,
  createEmptyMemory,
  type ConversationMemory,
  type OrchestratorOutput,
} from '@/lib/ai';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    intent?: string;
    responseMode?: 'executive' | 'operational';
  };
}

export function AddvaluChat() {
  const { user, filterProjectsByAccess } = useAuth();
  const { projects: allProjects } = useProjects();
  
  // Filtrar projetos por permissão do usuário
  const projects = useMemo(() => {
    return filterProjectsByAccess(allProjects);
  }, [allProjects, filterProjectsByAccess]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [memory, setMemory] = useState<ConversationMemory>(createEmptyMemory());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Saudação inicial
  useEffect(() => {
    if (messages.length === 0 && user) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
      
      const welcomeMsg: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `${greeting}${user?.name ? ', ' + user.name.split(' ')[0] : ''}. Sou a **Addvalu**, sua analista executiva virtual do NIE.\n\nPosso ajudar você com:\n• Resumo executivo da operação\n• Análise de riscos e gargalos\n• Prioridades de ação\n• Status de projetos\n• Disponibilidade da equipe\n\nO que você precisa saber?`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMsg]);
    }
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent, quickMessage?: string) => {
    e?.preventDefault();
    const messageText = quickMessage || input;
    
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await runExecutiveCopilot({
        question: messageText,
        projects,
        memory,
        userName: user?.name,
      });

      setMemory(result.memory);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        timestamp: Date.now(),
        metadata: {
          intent: result.metadata.intent,
          responseMode: result.metadata.responseMode,
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Tive um problema ao processar sua solicitação. Pode tentar novamente?',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    const formatted = formatResponseForDisplay(content);
    
    return (
      <div className="space-y-3">
        {formatted.sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            {section.title && section.title !== 'Resposta' && (
              <h4 className={cn(
                'font-semibold text-sm flex items-center gap-2',
                section.type === 'danger' && 'text-red-600',
                section.type === 'warning' && 'text-amber-600',
                section.type === 'success' && 'text-green-600',
                section.type === 'info' && 'text-[#0055A4]'
              )}>
                {section.type === 'danger' && <AlertTriangle className="w-4 h-4" />}
                {section.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                {section.type === 'success' && <CheckCircle className="w-4 h-4" />}
                {section.title}
              </h4>
            )}
            <div className={cn(
              'text-sm whitespace-pre-line',
              section.type === 'danger' && 'text-red-700 bg-red-50 p-3 rounded-lg',
              section.type === 'warning' && 'text-amber-700 bg-amber-50 p-3 rounded-lg',
              section.type === 'success' && 'text-green-700 bg-green-50 p-3 rounded-lg',
            )}>
              {section.content.split('\n').map((line, lineIdx) => {
                // Processar negrito
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={lineIdx} className={line.startsWith('•') ? 'ml-2' : ''}>
                    {parts.map((part, partIdx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={partIdx} className="font-semibold">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[450px] h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden mb-4"
          >
            {/* Header com Avatar da Addvalu */}
            <div className="bg-gradient-to-r from-[#0055A4] to-[#003d7a] p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Avatar
                  src="/Addvalu.jpeg"
                  name="Addvalu"
                  size="lg"
                  className="border-2 border-white/30"
                />
                <div>
                  <h3 className="font-bold text-sm leading-none">Addvalu</h3>
                  <p className="text-[10px] text-white/70 mt-1 uppercase tracking-wider font-medium">Copiloto Executivo NIE</p>
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
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <Avatar
                      src="/Addvalu.jpeg"
                      name="Addvalu"
                      size="md"
                      className="border-2 border-[#0055A4]/20"
                    />
                  )}
                  
                  {msg.role === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-[#F47920] flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm",
                      msg.role === 'user' 
                        ? "bg-[#F47920] text-white rounded-tr-none" 
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm"
                    )}>
                      {msg.role === 'assistant' 
                        ? renderMessageContent(msg.content)
                        : msg.content
                      }
                    </div>
                    
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar
                    src="/Addvalu.jpeg"
                    name="Addvalu"
                    size="md"
                    className="border-2 border-[#0055A4]/20"
                  />
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[#0055A4] rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#0055A4] rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#0055A4] rounded-full" />
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
                  onClick={() => handleSend(undefined, 'Análise de riscos')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium hover:bg-amber-200 transition-colors whitespace-nowrap"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Riscos
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(undefined, 'Prioridades')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 transition-colors whitespace-nowrap"
                >
                  <CheckCircle className="w-3 h-3" />
                  Prioridades
                </button>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] text-gray-400">Addvalu Copiloto Executivo NIE</p>
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
            <Sparkles className="w-4 h-4" />
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
            "relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 overflow-hidden",
            isOpen ? "bg-[#F47920]" : "bg-[#0055A4] hover:bg-[#004488]"
          )}
        >
          {isOpen && !isMinimized ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative w-full h-full">
              <Avatar
                src="/Addvalu.jpeg"
                name="Addvalu"
                size="xl"
                className="w-full h-full border-none"
              />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10" 
              />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
