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
   * Processa a mensagem do usuário usando o Orquestrador e Inteligência
   */
  public async getResponse(prompt: string, user: User): Promise<ChatMessage> {
    const startTime = Date.now();
    
    // 1. Obter Contexto Estruturado (Data + Permission + Intelligence + Memory)
    const context = await orchestrator.buildContext(prompt, user);

    // 2. Gerar Resposta via Inteligência (Novo Fluxo: Intent -> Tool -> Data -> Formatter)
    let responseText = await orchestrator.generateResponse(context, user);

    // 3. Response Guard - Bloquear frases banidas
    const BANNED_PHRASES = [
      "Recebi sua solicitação",
      "Como sou uma IA formatadora",
      "estou à disposição",
      "sob sua responsabilidade",
      "posso detalhar",
      "Entendi o que você precisa"
    ];

    const containsBanned = BANNED_PHRASES.some(phrase => 
      responseText.toLowerCase().includes(phrase.toLowerCase())
    );

    if (containsBanned) {
      console.warn(`[RESPONSE GUARD] Frase banida detectada. Rerodando fluxo...`);
      // Reroda com fallback simples se falhar novamente
      responseText = "Não localizei essa referência nos projetos ou painéis disponíveis. Pode me dizer se você quer consultar um projeto, painel ou análise?";
    }

    // 4. Implementar Log de Debug
    console.log(`
[ADDVALU DEBUG LOG]
message: "${prompt}"
detectedIntent: ${context.intent}
matchedEntity: ${context.toolResult?.id || context.toolResult?.nome || 'none'}
selectedTool: ${context.toolUsed}
fallbackUsed: ${context.intent === 'general_query' || context.intent === 'unknown'}
dataCount: ${Array.isArray(context.toolResult) ? context.toolResult.length : (context.toolResult ? 1 : 0)}
responseSource: ${context.toolUsed !== 'general_query' ? 'tool_result' : 'fallback'}
processingTime: ${Date.now() - startTime}ms
    `.trim());

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

  public getHistory() { return this.history; }
  public clearHistory() { this.history = []; }
}

export const aiService = AddvaluService.getInstance();
