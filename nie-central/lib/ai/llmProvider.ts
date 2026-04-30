/**
 * LLM Provider Abstraction
 *
 * Abstração agnóstica para chamar diferentes providers (OpenAI / Anthropic).
 * Uso exclusivamente server-side. A API key é lida de variáveis de ambiente
 * e NUNCA é exposta ao frontend.
 *
 * Env vars esperadas:
 *   LLM_PROVIDER  -> "openai" | "anthropic" (default: "openai")
 *   LLM_MODEL     -> ex: "gpt-4o-mini", "claude-3-5-sonnet-latest"
 *   LLM_API_KEY   -> chave do provider
 */

import OpenAI from 'openai';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  system: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  provider: string;
  model: string;
}

export class LLMNotConfiguredError extends Error {
  constructor(msg = 'LLM não configurada. Defina LLM_API_KEY no ambiente.') {
    super(msg);
    this.name = 'LLMNotConfiguredError';
  }
}

function resolveConfig() {
  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
  const apiKey = process.env.LLM_API_KEY || '';
  const model =
    process.env.LLM_MODEL ||
    (provider === 'anthropic' ? 'claude-3-5-sonnet-latest' : 'gpt-4o-mini');
  return { provider, apiKey, model };
}

export function isLLMConfigured(): boolean {
  return Boolean(process.env.LLM_API_KEY);
}

async function callOpenAI(req: LLMRequest, model: string, apiKey: string): Promise<LLMResponse> {
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model,
    temperature: req.temperature ?? 0.4,
    max_tokens: req.maxTokens ?? 1200,
    messages: [
      { role: 'system', content: req.system },
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  const text = completion.choices?.[0]?.message?.content?.trim() || '';
  return { text, provider: 'openai', model };
}

async function callAnthropic(req: LLMRequest, model: string, apiKey: string): Promise<LLMResponse> {
  // Anthropic separa system como campo top-level.
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: req.maxTokens ?? 1200,
      temperature: req.temperature ?? 0.4,
      system: req.system,
      messages: req.messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = (data?.content?.[0]?.text || '').trim();
  return { text, provider: 'anthropic', model };
}

/**
 * Ponto único de chamada a um LLM.
 * Lança LLMNotConfiguredError quando não há chave configurada — use para fallback.
 */
export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  const { provider, apiKey, model } = resolveConfig();

  if (!apiKey) {
    throw new LLMNotConfiguredError();
  }

  if (provider === 'anthropic') {
    return callAnthropic(req, model, apiKey);
  }
  return callOpenAI(req, model, apiKey);
}
