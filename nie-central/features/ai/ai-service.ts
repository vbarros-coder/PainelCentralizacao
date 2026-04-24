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
        toolUsed: context.toolUsed,
        toolResult: context.toolResult
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

    const { intent, toolResult } = context;

    // Lógica de Geração de Resposta Baseada no ToolResult
    if (intent === 'getExecutiveSummary' && toolResult) {
      const { active } = toolResult;
      return `### Panorama Executivo NIE
Temos atualmente **${active} projetos ativos** na plataforma. 

**Recomendação:** Acompanhar o status dos projetos ativos para garantir o cumprimento dos cronogramas estabelecidos.`;
    }

    if (intent === 'summarizeRisks' && toolResult) {
      const criticalCount = Array.isArray(toolResult) ? toolResult.length : 0;
      return `### Análise de Riscos e Atrasos
Identifiquei **${criticalCount} pontos de atenção** que requerem ação imediata.

Deseja que eu detalhe o plano de mitigação para algum desses projetos?`;
    }

    if (intent === 'getProjectsByDirectorate' && toolResult) {
      return `### Distribuição por Diretoria
Aqui está o detalhamento solicitado:

${Object.entries(toolResult || {}).map(([dir, projs]: [string, any]) => `- **${dir}**: ${projs.length} projetos`).join('\n') || '- Dados de agrupamento em processamento.'}`;
    }

    return `Recebi sua solicitação sobre "${context.question}". Como sou uma IA formatadora, analisei os dados e estou à disposição para detalhar qualquer ponto específico dos projetos sob sua responsabilidade.`;
  }

  public getHistory() { return this.history; }
  public clearHistory() { this.history = []; }
}

export const aiService = AddvaluService.getInstance();
