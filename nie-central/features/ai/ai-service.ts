import { User } from '@/types';
import { generateId } from '@/lib/utils';
import { orchestrator } from './orchestrator';
import { ADDVALU_SYSTEM_PROMPT } from './orchestrator';
import { AddvaluContext } from './types';

// Interface para a mensagem de chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  data?: any;
}

class AddvaluService {
  private static instance: AddvaluService;
  private history: ChatMessage[] = [];

  private constructor() {}

  public static getInstance(): AddvaluService {
    if (!AddvaluService.instance) {
      AddvaluService.instance = new AddvaluService();
    }
    return AddvaluService.instance;
  }

  /**
   * Processa a mensagem do usuário usando o novo Orquestrador e Inteligência
   */
  public async getResponse(prompt: string, user: User): Promise<ChatMessage> {
    // 1. Obter Contexto Estruturado (Data + Permission + Intelligence + Memory)
    const context = await orchestrator.buildContext(prompt, user);

    // 2. Chamar "Modelo" (Simulado com Raciocínio Baseado em Contexto)
    // Em produção, aqui enviamos o ADDVALU_SYSTEM_PROMPT + context para GPT-4/Gemini
    const responseText = await this.simulateAIReasoning(context);

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: responseText,
      timestamp: Date.now(),
      data: {
        intent: context.intent,
        summary: context.summary,
        alerts: context.alerts,
        insights: context.insights
      }
    };

    this.history.push({ id: generateId(), role: 'user', content: prompt, timestamp: Date.now() });
    this.history.push(assistantMessage);

    return assistantMessage;
  }

  /**
   * Simula o raciocínio da IA baseado no contexto estruturado
   * Implementa as regras do System Prompt: Direto, Sem "Entendi", Focado em Riscos
   */
  private async simulateAIReasoning(context: AddvaluContext): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const { intent, summary, insights, alerts, projects } = context;

    // Lógica de Geração de Resposta Baseada em Intenção
    if (intent === 'executive_summary') {
      return `### Panorama Executivo NIE
Temos atualmente **${summary.active} projetos ativos** com um progresso médio de **${summary.avgProgress}%**. 

**Riscos Identificados:**
${alerts.length > 0 ? alerts.map(a => `- ⚠️ ${a}`).join('\n') : '- ✅ Nenhuma criticidade imediata detectada.'}

**Insights Operacionais:**
${insights.map(i => `- ${i}`).join('\n')}

**Recomendação:** Focar na aceleração dos ${summary.delayed} projetos com progresso abaixo da média para garantir as entregas do trimestre.`;
    }

    if (intent === 'risk_analysis') {
      return `### Análise de Riscos e Atrasos
Identifiquei **${summary.delayed} pontos de atenção** que requerem ação imediata.

**Projetos Críticos:**
${projects.filter(p => (p.progresso || 0) < 30).slice(0, 3).map(p => `- **${p.nome}**: ${p.progresso}% (Diretoria: ${p.diretoria})`).join('\n')}

**Impacto Operacional:**
${insights[0] || 'A carga de trabalho está distribuída, mas o baixo progresso em projetos chave pode impactar o SLA global.'}

Deseja que eu detalhe o plano de mitigação para algum desses projetos?`;
    }

    if (intent === 'group_by_directorate') {
      return `### Distribuição por Diretoria
Aqui está o detalhamento solicitado:

${Object.entries(context.summary.byDirectorate || {}).map(([dir, count]) => `- **${dir}**: ${count} projetos`).join('\n') || '- Dados de agrupamento em processamento.'}

Notei que a diretoria **Property** concentra o maior volume de projetos ativos no momento.`;
    }

    // Resposta Padrão (Agente Proativo)
    return `Atualmente gerencio **${summary.total} itens** no seu escopo de acesso. 
    
${alerts[0] ? `**Alerta Prioritário:** ${alerts[0]}` : 'Tudo operando dentro da normalidade.'}

O que você gostaria de analisar especificamente? Posso detalhar riscos, agrupar por diretoria ou fornecer um resumo executivo.`;
  }

  public getHistory() { return this.history; }
  public clearHistory() { this.history = []; }
}

export const aiService = AddvaluService.getInstance();
