/**
 * Orchestrator
 * Orquestrador principal da Addvalu Copiloto Executivo
 */

import { Project, User } from '@/types';
import { SYSTEM_PROMPT } from './systemPrompt';
import { detectIntent, detectResponseMode } from './detectIntent';
import { buildExecutiveContext, formatContextForAI } from './buildExecutiveContext';
import {
  ConversationMemory,
  createEmptyMemory,
  updateConversationMemory,
} from './conversationMemory';

export interface OrchestratorInput {
  question: string;
  projects: Project[];
  users?: User[];
  memory?: ConversationMemory;
  userName?: string;
}

export interface OrchestratorOutput {
  answer: string;
  memory: ConversationMemory;
  context: ReturnType<typeof buildExecutiveContext>;
  metadata: {
    intent: string;
    responseMode: 'executive' | 'operational';
    processingTime: number;
  };
}

/**
 * Processa a pergunta do usuário e retorna resposta estruturada
 * Sem dependência de API externa - usa inteligência em código
 */
export async function runExecutiveCopilot({
  question,
  projects,
  users = [],
  memory = createEmptyMemory(),
  userName,
}: OrchestratorInput): Promise<OrchestratorOutput> {
  const startTime = Date.now();

  // 1. Detectar intenção
  const intent = detectIntent(question);
  const responseMode = detectResponseMode(intent);

  // 2. Atualizar memória
  const updatedMemory = updateConversationMemory(memory, question, intent);

  // 3. Filtrar projetos relevantes (se houver diretoria na memória ou pergunta)
  let relevantProjects = [...projects];
  
  if (updatedMemory.lastDirectorate) {
    const directorateProjects = projects.filter(
      (p) =>
        p.diretoria.toLowerCase().includes(updatedMemory.lastDirectorate!.toLowerCase())
    );
    if (directorateProjects.length > 0) {
      relevantProjects = directorateProjects;
    }
  }

  // 4. Construir contexto executivo
  const context = buildExecutiveContext({
    question,
    intent,
    responseMode,
    projects: relevantProjects,
    users,
    memory: updatedMemory,
  });

  // 5. Gerar resposta inteligente (sem API externa)
  const answer = generateSmartResponse(context, userName);

  const processingTime = Date.now() - startTime;

  return {
    answer,
    memory: updatedMemory,
    context,
    metadata: {
      intent,
      responseMode,
      processingTime,
    },
  };
}

/**
 * Gera resposta inteligente baseada no contexto
 * Implementação local sem dependência de API externa
 */
function generateSmartResponse(
  context: ReturnType<typeof buildExecutiveContext>,
  userName?: string
): string {
  const { intent, responseMode, summary, insights, alerts, priorities, featuredProjectsList } = context;

  const greeting = userName ? `Olá ${userName.split(' ')[0]}, ` : '';

  switch (intent) {
    case 'greeting':
      return `${greeting}sou a Addvalu, sua analista executiva virtual do NIE. Estou conectada aos dados do sistema e posso ajudar com:

• Resumo executivo da operação
• Análise de riscos e gargalos
• Prioridades de ação
• Status de projetos específicos
• Disponibilidade da equipe

O que você precisa saber?`;

    case 'executive_summary':
      return `${greeting}**Situação Atual do Portfólio**

Temos **${summary.totalProjects} projetos** no sistema:
• **${summary.activeProjects}** ativos (progresso médio: ${summary.averageProgress}%)
• **${summary.completedProjects}** concluídos
• **${summary.planningProjects}** em planejamento
• **${summary.pausedProjects}** pausados

${insights.length > 0 ? `\n**Pontos de Atenção:**\n${insights.slice(0, 3).map((i) => `• ${i}`).join('\n')}` : ''}

${priorities.length > 0 ? `\n**Prioridades:**\n${priorities.slice(0, 3).join('\n')}` : ''}`;

    case 'risk_analysis':
      const risks = insights.filter((i) => i.toLowerCase().includes('risco') || i.toLowerCase().includes('atraso'));
      return `${greeting}**Análise de Riscos**

${risks.length > 0
  ? risks.slice(0, 5).map((r) => `• ${r}`).join('\n')
  : insights.length > 0
  ? insights.slice(0, 5).map((i) => `• ${i}`).join('\n')
  : 'Nenhum risco crítico identificado no momento.'}

${alerts.length > 0 ? `\n**Alertas:**\n${alerts.map((a) => `⚠️ ${a}`).join('\n')}` : ''}`;

    case 'priority_recommendation':
      return `${greeting}**Prioridades de Ação**

${priorities.length > 0
  ? priorities.slice(0, 5).join('\n')
  : 'Com base na análise atual, recomendo focar em:\n\n1. Projetos em destaque com baixo progresso\n2. Iniciar projetos que estão há muito tempo em planejamento\n3. Retomar projetos pausados com alta prioridade'}`;

    case 'availability_query':
      return `${greeting}**Disponibilidade da Equipe**

Consulte a aba "Equipe" no menu lateral para visualizar em tempo real quem está disponível, ocupado ou ausente.

Posso também ajudar a identificar responsáveis por projetos específicos se precisar.`;

    case 'list':
      const projectList = context.projects.slice(0, 10);
      return `${greeting}**Projetos Encontrados (${context.projects.length})**

${projectList.map((p, i) => `${i + 1}. **${p.nome}** - ${p.diretoria} (${p.progresso || 0}%)`).join('\n')}

${context.projects.length > 10 ? `\n... e mais ${context.projects.length - 10} projetos.` : ''}`;

    case 'follow_up':
      if (context.conversationMemory.lastDirectorate) {
        const dirProjects = context.projects.filter(
          (p) => p.diretoria === context.conversationMemory.lastDirectorate
        );
        return `${greeting}**${context.conversationMemory.lastDirectorate}**

${dirProjects.length} projetos nesta diretoria:
• ${dirProjects.filter((p) => p.status === 'ativo').length} ativos
• ${dirProjects.filter((p) => p.status === 'concluido').length} concluídos

${dirProjects
  .filter((p) => p.status === 'ativo')
  .slice(0, 5)
  .map((p) => `• ${p.nome} (${p.progresso || 0}%)`)
  .join('\n')}`;
      }
      return `${greeting}Pode especificar melhor o que você gostaria de saber? Posso analisar por diretoria, responsável ou status.`;

    default:
      // Resposta padrão inteligente
      return `${greeting}**Análise do Cenário**

${summary.totalProjects > 0
  ? `Portfólio com ${summary.totalProjects} projetos. ${summary.activeProjects} ativos, ${summary.completedProjects} concluídos.`
  : 'Não encontrei projetos com os critérios informados.'}

${insights.length > 0 ? `\n**Observações:**\n${insights.slice(0, 3).map((i) => `• ${i}`).join('\n')}` : ''}

${responseMode === 'executive' && priorities.length > 0
  ? `\n**Recomendação:** ${priorities[0]}`
  : ''}

Posso detalhar qualquer um desses pontos. O que seria mais útil agora?`;
  }
}

/**
 * Formata a resposta para exibição no frontend
 */
export function formatResponseForDisplay(answer: string): {
  summary?: string;
  sections: Array<{ title: string; content: string; type: 'info' | 'warning' | 'success' | 'danger' }>;
} {
  const lines = answer.split('\n');
  const sections: Array<{ title: string; content: string; type: 'info' | 'warning' | 'success' | 'danger' }> = [];
  
  let currentSection: { title: string; content: string[]; type: 'info' | 'warning' | 'success' | 'danger' } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detectar tipo de seção
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      if (currentSection) {
        sections.push({
          ...currentSection,
          content: currentSection.content.join('\n'),
        });
      }
      const title = trimmed.replace(/\*\*/g, '');
      const type: 'info' | 'warning' | 'success' | 'danger' =
        title.toLowerCase().includes('risco') || title.toLowerCase().includes('alerta')
          ? 'danger'
          : title.toLowerCase().includes('atenção') || title.toLowerCase().includes('prioridade')
          ? 'warning'
          : title.toLowerCase().includes('concluído') || title.toLowerCase().includes('sucesso')
          ? 'success'
          : 'info';
      
      currentSection = { title, content: [], type };
    } else if (currentSection) {
      currentSection.content.push(trimmed);
    }
  }

  if (currentSection) {
    sections.push({
      ...currentSection,
      content: currentSection.content.join('\n'),
    });
  }

  return {
    summary: lines[0]?.startsWith('Olá') ? lines[0] : undefined,
    sections: sections.length > 0 ? sections : [{ title: 'Resposta', content: answer, type: 'info' }],
  };
}
