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
  source?: 'llm' | 'fallback';
}

interface LLMChatAPIResponse {
  text?: string | null;
  provider?: string;
  model?: string;
  llmError?: string;
  llmErrorStatus?: number | null;
  error?: string;
}

const BANNED_PHRASES = [
  'Recebi sua solicitação',
  'Como sou uma IA formatadora',
  'estou à disposição',
  'sob sua responsabilidade',
  'posso detalhar',
  'Entendi o que você precisa',
];

function stripBanned(text: string): string {
  const contains = BANNED_PHRASES.some((p) => text.toLowerCase().includes(p.toLowerCase()));
  return contains
    ? 'Não localizei essa referência nos projetos ou painéis disponíveis. Pode me dizer se você quer consultar um projeto, painel ou análise?'
    : text;
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
   * Tenta gerar a resposta via LLM (backend). Se falhar por qualquer motivo
   * (API indisponível, sem chave configurada, erro de rede), retorna null
   * para que o fluxo caia no fallback determinístico.
   */
  private async tryLLMResponse(
    prompt: string,
    context: AddvaluContext
  ): Promise<{ text: string; provider?: string; model?: string } | null> {
    try {
      // Histórico recente (últimas 8 mensagens) para manter contexto enxuto
      const recent = this.history
        .slice(-8)
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/addvalu/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question: prompt,
          history: recent,
          toolContext: {
            intent: context.intent,
            toolUsed: context.toolUsed,
            toolResult: context.toolResult,
          },
        }),
      });

      if (!res.ok) {
        const payload: LLMChatAPIResponse = await res.json().catch(() => ({}));
        console.warn('[ADDVALU] LLM API HTTP error, usando fallback:', res.status, payload.error);
        return null;
      }

      const payload: LLMChatAPIResponse = await res.json();

      if (payload.llmError) {
        console.warn(
          `[ADDVALU] LLM indisponível (${payload.llmError}${
            payload.llmErrorStatus ? `/${payload.llmErrorStatus}` : ''
          }), usando fallback determinístico`
        );
        return null;
      }

      if (!payload.text) return null;
      return { text: payload.text, provider: payload.provider, model: payload.model };
    } catch (err) {
      console.warn('[ADDVALU] Erro ao chamar LLM, usando fallback:', err);
      return null;
    }
  }

  /**
   * Processa a mensagem do usuário usando o Orquestrador e Inteligência.
   *
   * Fluxo híbrido:
   *   1. Orchestrator identifica intenção e executa tools (dados reais).
   *   2. Tenta resposta via LLM (backend /api/addvalu/chat) com contexto das tools.
   *   3. Se LLM falhar/não estiver configurada, usa generateResponse() determinístico.
   *   4. Aplica guard para frases banidas.
   */
  public async getResponse(prompt: string, user: User): Promise<ChatMessage> {
    const startTime = Date.now();

    // 1. Obter Contexto Estruturado (Data + Permission + Intelligence + Memory)
    const context = await orchestrator.buildContext(prompt, user);

    // 2. Tentar LLM primeiro
    const llmResult = await this.tryLLMResponse(prompt, context);

    let responseText: string;
    let source: 'llm' | 'fallback';
    let meta: { provider?: string; model?: string } = {};

    if (llmResult && llmResult.text) {
      responseText = stripBanned(llmResult.text);
      source = 'llm';
      meta = { provider: llmResult.provider, model: llmResult.model };
    } else {
      // 3. Fallback determinístico (comportamento anterior preservado)
      const deterministic = await orchestrator.generateResponse(context, user);
      responseText = stripBanned(deterministic);
      source = 'fallback';
    }

    // 4. Log de Debug
    console.log(
      `
[ADDVALU DEBUG LOG]
message: "${prompt}"
detectedIntent: ${context.intent}
matchedEntity: ${context.toolResult?.id || context.toolResult?.nome || 'none'}
selectedTool: ${context.toolUsed}
source: ${source}${meta.provider ? ` (${meta.provider}/${meta.model})` : ''}
dataCount: ${
        Array.isArray(context.toolResult)
          ? context.toolResult.length
          : context.toolResult
          ? 1
          : 0
      }
processingTime: ${Date.now() - startTime}ms
      `.trim()
    );

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: responseText,
      timestamp: Date.now(),
      source,
      data: {
        intent: context.intent,
        toolUsed: context.toolUsed,
        toolResult: context.toolResult,
        ...meta,
      },
    };

    this.history.push({
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    });
    this.history.push(assistantMessage);

    return assistantMessage;
  }

  public getHistory() {
    return this.history;
  }
  public clearHistory() {
    this.history = [];
  }
}

export const aiService = AddvaluService.getInstance();

// Re-exportado para compatibilidade (fonte oficial vive em lib/ai/systemPrompt.ts)
export { ADDVALU_SYSTEM_PROMPT };
