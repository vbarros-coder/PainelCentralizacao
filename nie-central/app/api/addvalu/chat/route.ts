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
 */

import { NextRequest, NextResponse } from 'next/server';
import { ADDVALU_SYSTEM_PROMPT } from '@/lib/ai/systemPrompt';
import {
  callLLM,
  isLLMConfigured,
  LLMMessage,
  LLMNotConfiguredError,
} from '@/lib/ai/llmProvider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    // Cap para não estourar contexto
    if (serialized.length > 8000) serialized = serialized.slice(0, 8000) + '\n... [truncado]';
    parts.push(`Resultado:\n${serialized}`);
  }
  parts.push(
    'Se o resultado estiver vazio ou não cobrir a pergunta, informe isso claramente ao usuário em vez de inventar.'
  );
  return parts.join('\n');
}

export async function POST(req: NextRequest) {
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

  if (!isLLMConfigured()) {
    return NextResponse.json(
      { error: 'llm_not_configured' },
      { status: 503 }
    );
  }

  const messages: LLMMessage[] = [];

  // Contexto das tools (se houver) vai como mensagem de system secundária
  const contextBlock = buildContextBlock(body);
  if (contextBlock) {
    messages.push({ role: 'system', content: contextBlock });
  }

  // Histórico recente (últimas 8 mensagens para manter contexto enxuto)
  const history = (body.history || []).slice(-8);
  for (const m of history) {
    if (!m?.content) continue;
    messages.push({ role: m.role, content: m.content });
  }

  // Pergunta atual
  messages.push({ role: 'user', content: question });

  try {
    const llmResponse = await callLLM({
      system: ADDVALU_SYSTEM_PROMPT,
      messages,
      temperature: 0.4,
      maxTokens: 1200,
    });

    if (!llmResponse.text) {
      return NextResponse.json({ error: 'empty_response' }, { status: 502 });
    }

    return NextResponse.json({
      text: llmResponse.text,
      provider: llmResponse.provider,
      model: llmResponse.model,
    });
  } catch (err) {
    if (err instanceof LLMNotConfiguredError) {
      return NextResponse.json({ error: 'llm_not_configured' }, { status: 503 });
    }
    console.error('[ADDVALU /api/chat] LLM error:', err);
    return NextResponse.json(
      { error: 'llm_error', message: err instanceof Error ? err.message : 'unknown' },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    configured: isLLMConfigured(),
    provider: process.env.LLM_PROVIDER || 'openai',
    model:
      process.env.LLM_MODEL ||
      (process.env.LLM_PROVIDER === 'anthropic'
        ? 'claude-3-5-sonnet-latest'
        : 'gpt-4o-mini'),
  });
}
