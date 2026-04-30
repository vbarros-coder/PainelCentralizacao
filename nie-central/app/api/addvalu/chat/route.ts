/**
 * POST /api/addvalu/chat
 *
 * Endpoint backend da ADDVALU.
 * - Recebe a pergunta do usuário + contexto de tools + histórico recente.
 * - Aplica o ADDVALU_SYSTEM_PROMPT como instrução oficial.
 * - Chama o LLM configurado via LLM_API_KEY.
 * - Retorna o texto gerado.
 *
 * A API key NÃO trafega para o frontend. Apenas a resposta textual volta.
 *
 * Política de erros:
 *   A rota NUNCA retorna 5xx para erro de LLM. Sempre responde 200 com
 *   `{ text?: string, llmError?: LLMErrorCode }`. O cliente, ao ver llmError,
 *   decide usar o fallback determinístico. Isso evita 502 no console do browser.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ADDVALU_SYSTEM_PROMPT } from '@/lib/ai/systemPrompt';
import {
  callLLM,
  getLLMInfo,
  LLMError,
  LLMMessage,
} from '@/lib/ai/llmProvider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Vercel: garante até 30s de execução (default é 10s no plano Hobby)
export const maxDuration = 30;

interface ChatRequestBody {
  question: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  toolContext?: {
    intent?: string;
    toolUsed?: string;
    toolResult?: unknown;
  };
}

function buildContextBlock(body: ChatRequestBody): string | null {
  const ctx = body.toolContext;
  if (!ctx || (!ctx.toolResult && !ctx.intent)) return null;

  const parts: string[] = [];
  parts.push('## DADOS INTERNOS (fonte oficial — use apenas estes dados, não invente)');
  if (ctx.intent) parts.push(`Intenção detectada: ${ctx.intent}`);
  if (ctx.toolUsed) parts.push(`Tool utilizada: ${ctx.toolUsed}`);
  if (ctx.toolResult !== undefined && ctx.toolResult !== null) {
    let serialized: string;
    try {
      serialized = JSON.stringify(ctx.toolResult, null, 2);
    } catch {
      serialized = String(ctx.toolResult);
    }
    if (serialized.length > 8000) serialized = serialized.slice(0, 8000) + '\n... [truncado]';
    parts.push(`Resultado:\n${serialized}`);
  }
  parts.push(
    'Se o resultado estiver vazio ou não cobrir a pergunta, informe isso claramente ao usuário em vez de inventar.'
  );
  return parts.join('\n');
}

export async function POST(req: NextRequest) {
  const info = getLLMInfo();

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const question = (body.question || '').trim();
  if (!question) {
    return NextResponse.json({ error: 'empty_question' }, { status: 400 });
  }

  // Log inicial seguro (não vaza a key, só o comprimento)
  console.log(
    `[ADDVALU /api/chat] incoming POST | provider=${info.provider} model=${info.model} ` +
      `configured=${info.configured} apiKeyLen=${info.apiKeyLength}`
  );

  if (!info.configured) {
    // 200 + diagnóstico para o cliente cair no fallback sem 5xx no console
    return NextResponse.json({
      text: null,
      llmError: 'missing_api_key',
      provider: info.provider,
      model: info.model,
    });
  }

  const messages: LLMMessage[] = [];

  const contextBlock = buildContextBlock(body);
  if (contextBlock) {
    messages.push({ role: 'system', content: contextBlock });
  }

  const history = (body.history || []).slice(-8);
  for (const m of history) {
    if (!m?.content) continue;
    messages.push({ role: m.role, content: m.content });
  }

  messages.push({ role: 'user', content: question });

  try {
    const llmResponse = await callLLM({
      system: ADDVALU_SYSTEM_PROMPT,
      messages,
      temperature: 0.4,
      maxTokens: 1200,
    });

    if (!llmResponse.text) {
      console.warn('[ADDVALU /api/chat] LLM retornou texto vazio');
      return NextResponse.json({
        text: null,
        llmError: 'unknown_error',
        provider: info.provider,
        model: info.model,
      });
    }

    console.log(
      `[ADDVALU /api/chat] OK | provider=${llmResponse.provider} model=${llmResponse.model} chars=${llmResponse.text.length}`
    );

    return NextResponse.json({
      text: llmResponse.text,
      provider: llmResponse.provider,
      model: llmResponse.model,
    });
  } catch (err) {
    if (err instanceof LLMError) {
      // Log seguro sem expor a key
      console.error(
        `[ADDVALU /api/chat] LLM ${err.code} | provider=${info.provider} model=${info.model} ` +
          `status=${err.status ?? 'n/a'} msg=${(err.providerMessage || err.message || '').slice(0, 500)}`
      );
      // providerMessage é mensagem de erro da OpenAI/Anthropic - não contém a API key,
      // só descreve o que a API reclamou (ex.: "Unsupported parameter...", "model not found")
      const safeProviderMsg = (err.providerMessage || err.message || '').slice(0, 300);
      return NextResponse.json({
        text: null,
        llmError: err.code,
        llmErrorStatus: err.status ?? null,
        llmErrorMessage: safeProviderMsg,
        provider: info.provider,
        model: info.model,
      });
    }

    const msg = err instanceof Error ? err.message : 'unknown';
    console.error(`[ADDVALU /api/chat] unexpected error: ${msg}`);
    return NextResponse.json({
      text: null,
      llmError: 'unknown_error',
      llmErrorMessage: msg.slice(0, 300),
      provider: info.provider,
      model: info.model,
    });
  }
}

export async function GET() {
  const info = getLLMInfo();
  return NextResponse.json({
    configured: info.configured,
    provider: info.provider,
    model: info.model,
    // Diagnóstico seguro - nunca retorna a key, só o tipo/tamanho
    apiKeyLength: info.apiKeyLength,
    apiKeyPrefix: info.apiKeyPrefix, // ex.: "sk-proj" ou "sk-...."
  });
}
