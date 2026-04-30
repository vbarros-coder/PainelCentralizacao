/**
 * Addvalu Chat - Copiloto Executivo
 * Interface do chat com a analista executiva virtual
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  User,
} from 'lucide-react';
import { useAuth } from '@/features/auth/auth-context';
import { Avatar } from '@/components/ui';
import { aiService, type ChatMessage } from './ai-service';
import { cn } from '@/lib/utils';

export function AddvaluChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Saudação inicial customizada via IA
  useEffect(() => {
    if (messages.length === 0 && user) {
      const initChat = async () => {
        setIsLoading(true);
        const response = await aiService.getResponse('olá', user);
        setMessages([response]);
        setIsLoading(false);
      };
      initChat();
    }
  }, [user]);

  // Abre o chat ao receber evento do botão "?" do topbar
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open-addvalu-chat', handler);
    return () => window.removeEventListener('open-addvalu-chat', handler);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent, quickMessage?: string) => {
    e?.preventDefault();
    const messageText = quickMessage || input;
    
    if (!messageText.trim() || isLoading || !user) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.getResponse(messageText, user);
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      const errorMsg: ChatMessage = {
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

  const renderMessageContent = (msg: ChatMessage) => {
    const { content, data } = msg;
    
    return (
      <div className="space-y-4">
        {/* Renderização de Markdown Simples */}
        <div className="text-sm space-y-2 prose prose-sm dark:prose-invert max-w-none">
          {content.split('\n').map((line, idx) => {
            if (line.startsWith('###')) return <h3 key={idx} className="text-base font-bold text-[#0055A4] mt-4 mb-2">{line.replace('###', '')}</h3>;
            if (line.startsWith('**')) return <p key={idx} className="font-semibold text-gray-900 dark:text-white">{line.replace(/\*\*/g, '')}</p>;
            if (line.startsWith('-')) return <li key={idx} className="ml-2 list-none flex items-start gap-2"><span>•</span> {line.replace('-', '').trim()}</li>;
            return <p key={idx} className="leading-relaxed">{line}</p>;
          })}
        </div>

        {/* Blocos Estruturados Premium */}
        {data && (
          <div className="grid grid-cols-1 gap-2 mt-4">
            {data.alerts?.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-800 dark:text-red-300">Alertas Críticos</p>
                  <p className="text-[11px] text-red-700 dark:text-red-400">{data.alerts[0]}</p>
                </div>
              </div>
            )}
            
            {data.insights?.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-xl flex items-start gap-3">
                <BarChart3 className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Insight Operacional</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400">{data.insights[0]}</p>
                </div>
              </div>
            )}
          </div>
        )}
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
            className="w-[450px] h-[650px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden mb-4"
          >
            {/* Header Premium */}
            <div className="bg-gradient-to-r from-[#0055A4] to-[#003d7a] p-4 flex items-center justify-between text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar src="/Addvalu.jpeg" name="Addvalu" size="lg" className="border-2 border-white/30" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0055A4] rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm leading-none">Addvalu</h3>
                    <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-widest font-bold">IA Ativa</span>
                  </div>
                  <p className="text-[10px] text-white/70 mt-1 uppercase tracking-wider font-medium">Copiloto Executivo NIE</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Area de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-gray-950/20">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  {msg.role === 'assistant' ? (
                    <Avatar src="/Addvalu.jpeg" name="Addvalu" size="md" className="border-2 border-[#0055A4]/20 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#F47920] flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm shadow-sm",
                      msg.role === 'user' 
                        ? "bg-[#F47920] text-white rounded-tr-none" 
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none"
                    )}>
                      {msg.role === 'assistant' ? renderMessageContent(msg) : msg.content}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1.5 px-1 font-medium">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar src="/Addvalu.jpeg" name="Addvalu" size="md" className="border-2 border-[#0055A4]/20" />
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[#0055A4] rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#0055A4] rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#0055A4] rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input & Quick Actions */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => handleSend(undefined, 'Resumo executivo')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#0055A4] dark:text-blue-400 rounded-full text-[10px] font-bold hover:bg-blue-100 transition-colors whitespace-nowrap border border-blue-100 dark:border-blue-800"
                >
                  <BarChart3 className="w-3 h-3" /> RESUMO
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(undefined, 'Análise de riscos')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold hover:bg-amber-100 transition-colors whitespace-nowrap border border-amber-100 dark:border-amber-800"
                >
                  <AlertTriangle className="w-3 h-3" /> RISCOS
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(undefined, 'Quais projetos concluídos?')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold hover:bg-green-100 transition-colors whitespace-nowrap border border-green-100 dark:border-green-800"
                >
                  <CheckCircle className="w-3 h-3" /> CONCLUÍDOS
                </button>
              </div>

              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Consulte o NIE agora..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0055A4] transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-[#0055A4] text-white p-3 rounded-xl hover:bg-[#004488] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Flutuante Premium */}
      <div className="flex items-center gap-3">
        {isMinimized && isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsMinimized(false)}
            className="bg-[#0055A4] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs tracking-widest hover:scale-105 transition-all uppercase"
          >
            <Sparkles className="w-4 h-4" /> IA Ativa
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => (isOpen && isMinimized ? setIsMinimized(false) : setIsOpen(!isOpen))}
          className={cn(
            "relative w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all duration-300 overflow-hidden border-2",
            isOpen ? "bg-[#F47920] border-white/20" : "bg-white border-[#0055A4]/10"
          )}
        >
          {isOpen && !isMinimized ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <div className="relative w-full h-full p-0.5">
              <Avatar src="/Addvalu.jpeg" name="Addvalu" size="xl" className="w-full h-full border-none rounded-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm" />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
