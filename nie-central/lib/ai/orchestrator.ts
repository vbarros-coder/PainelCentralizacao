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

/**
 * Entity Resolver - Localiza projetos ou painéis citados na pergunta
 */
function resolveEntityMention(question: string, projects: Project[]): Project | null {
  const q = question.toLowerCase().trim();
  
  // Busca exata ou parcial por nome de projeto
  const project = projects.find(p => 
    q.includes(p.nome.toLowerCase()) || 
    p.nome.toLowerCase().includes(q)
  );

  return project || null;
}

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

  // 1.1 Entity Lookup (Prioridade Máxima)
  const resolvedEntity = resolveEntityMention(question, projects);

  // 2. Atualizar memória
  const updatedMemory = updateConversationMemory(memory, question, intent);

  // 3. Filtrar projetos relevantes
  let relevantProjects = resolvedEntity ? [resolvedEntity] : [...projects];
  
  if (!resolvedEntity && updatedMemory.lastDirectorate) {
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
    intent: resolvedEntity ? 'project_lookup' : intent,
    responseMode: resolvedEntity ? 'operational' : responseMode,
    projects: relevantProjects,
    users,
    memory: updatedMemory,
  });

  // 5. Gerar resposta inteligente (sem API externa)
  const answer = generateSmartResponse(context, userName, resolvedEntity);

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
  userName?: string,
  resolvedEntity?: Project | null
): string {
  const { intent, responseMode, summary, insights, alerts, priorities } = context;

  // Prioridade 1: Entity Lookup Resolvido
  if (resolvedEntity) {
    return `**${resolvedEntity.nome}**
Status: ${resolvedEntity.status.toUpperCase()}
Diretoria: ${resolvedEntity.diretoria}
Responsável: ${resolvedEntity.responsavel || 'Não definido'}

${resolvedEntity.descricao ? `Descrição: ${resolvedEntity.descricao}` : ''}
${resolvedEntity.link ? `Link: ${resolvedEntity.link}` : ''}`;
  }

  const greeting = userName ? `Olá ${userName.split(' ')[0]}, ` : '';

  switch (intent) {
    case 'project_lookup':
    case 'project_status_query':
    case 'entity_reference':
      if (context.projects.length > 0) {
        const p = context.projects[0];
        return `**${p.nome}**
Status: ${p.status.toUpperCase()}
Responsável: ${p.responsavel || 'Não definido'}
Diretoria: ${p.diretoria}`;
      }
      return `Não localizei detalhes específicos para "${context.question}". Pode confirmar o nome do projeto?`;

    case 'greeting':
      return `Addvalu Copiloto Operacional. Informe o nome de um projeto ou selecione uma análise:
• **Resumo Executivo**
• **Riscos e Gargalos**
• **Prioridades**
• **Status da Equipe**`;

    case 'executive_summary':
      return `**Panorama Operacional**
Total: ${summary.totalProjects} | Ativos: ${summary.activeProjects} | Concluídos: ${summary.completedProjects}

${insights.slice(0, 3).map((i) => `• ${i}`).join('\n')}

**Principais Prioridades:**
${priorities.slice(0, 2).join('\n')}`;

    case 'risk_analysis':
      const risks = insights.filter((i) => i.toLowerCase().includes('risco') || i.toLowerCase().includes('atraso'));
      return `**Riscos e Alertas**
${risks.length > 0 ? risks.slice(0, 5).map((r) => `• ${r}`).join('\n') : 'Sem riscos críticos identificados.'}

${alerts.map((a) => `⚠️ ${a}`).join('\n')}`;

    case 'priority_recommendation':
      return `**Ações Prioritárias**
${priorities.slice(0, 5).join('\n')}`;

    case 'availability_query':
      return `**Status da Equipe**
Acesse o menu "Equipe" para visão em tempo real. Posso filtrar por responsável se desejar.`;

    case 'list':
      return `**Projetos (${context.projects.length})**
${context.projects.slice(0, 10).map((p) => `• **${p.nome}** [${p.status}]`).join('\n')}`;

    default:
      if (summary.totalProjects > 0) {
        return `**Análise de Dados**
Portfólio com ${summary.totalProjects} projetos (${summary.activeProjects} ativos).

${insights.slice(0, 2).map((i) => `• ${i}`).join('\n')}

Deseja detalhes de algum projeto específico?`;
      }
      return `Não identifiquei a referência exata. Pode me dizer qual projeto ou diretoria deseja consultar?`;
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
