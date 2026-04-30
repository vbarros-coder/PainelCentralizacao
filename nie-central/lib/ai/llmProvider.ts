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

export type LLMErrorCode =
  | 'missing_api_key'
  | 'invalid_api_key'
  | 'billing_error'
  | 'rate_limit'
  | 'timeout'
  | 'model_not_found'
  | 'provider_error'
  | 'network_error'
  | 'unknown_error';

export class LLMError extends Error {
  code: LLMErrorCode;
  status?: number;
  providerMessage?: string;

  constructor(code: LLMErrorCode, message: string, status?: number, providerMessage?: string) {
    super(message);
    this.name = 'LLMError';
    this.code = code;
    this.status = status;
    this.providerMessage = providerMessage;
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

export function getLLMInfo() {
  const { provider, apiKey, model } = resolveConfig();
  return {
    configured: Boolean(apiKey),
    provider,
    model,
    apiKeyLength: apiKey ? apiKey.length : 0,
  };
}

/**
 * Classifica um erro arbitrário do provider em LLMErrorCode.
 */
function classifyError(err: unknown, provider: string): LLMError {
  const anyErr = err as any;

  // OpenAI SDK v4+: erros têm .status, .message, e .error com corpo completo da API
  const status: number | undefined =
    anyErr?.status ?? anyErr?.response?.status ?? anyErr?.statusCode;

  // Mensagem mais específica da API (ex.: "Unsupported parameter: 'max_tokens' ...")
  const apiMessage: string | undefined =
    anyErr?.error?.message ??
    anyErr?.response?.data?.error?.message ??
    anyErr?.response?.body?.error?.message;

  const rawMsg: string = apiMessage || anyErr?.message || String(err);

  const errType: string | undefined =
    anyErr?.error?.type ?? anyErr?.type ?? anyErr?.code ?? anyErr?.error?.code;

  const lower = (rawMsg || '').toLowerCase();

  if (status === 401 || lower.includes('invalid api key') || lower.includes('incorrect api key')) {
    return new LLMError('invalid_api_key', 'API key inválida.', status, rawMsg);
  }
  if (
    status === 402 ||
    lower.includes('billing') ||
    lower.includes('quota') ||
    lower.includes('insufficient_quota')
  ) {
    return new LLMError('billing_error', 'Problema de billing/cota no provider.', status, rawMsg);
  }
  if (status === 429 || lower.includes('rate limit')) {
    return new LLMError('rate_limit', 'Rate limit atingido no provider.', status, rawMsg);
  }
  if (
    status === 404 ||
    (lower.includes('model') && (lower.includes('not found') || lower.includes('does not exist')))
  ) {
    return new LLMError(
      'model_not_found',
      'Modelo configurado não existe ou indisponível.',
      status,
      rawMsg
    );
  }
  if (errType === 'ETIMEDOUT' || lower.includes('timeout') || lower.includes('timed out')) {
    return new LLMError('timeout', 'Timeout ao chamar o provider.', status, rawMsg);
  }
  if (
    errType === 'ENOTFOUND' ||
    errType === 'ECONNREFUSED' ||
    lower.includes('fetch failed') ||
    lower.includes('network')
  ) {
    return new LLMError('network_error', 'Falha de rede ao chamar o provider.', status, rawMsg);
  }
  // 400 = Bad Request — geralmente parâmetro/payload inválido
  if (status === 400) {
    return new LLMError(
      'provider_error',
      `Requisição rejeitada pelo ${provider} (400): ${rawMsg}`,
      status,
      rawMsg
    );
  }
  if (status && status >= 500) {
    return new LLMError(
      'provider_error',
      `Erro interno do provider (${status}): ${rawMsg}`,
      status,
      rawMsg
    );
  }

  return new LLMError(
    'unknown_error',
    rawMsg || `Erro desconhecido chamando ${provider}.`,
    status,
    rawMsg
  );
}

async function callOpenAI(req: LLMRequest, model: string, apiKey: string): Promise<LLMResponse> {
  const client = new OpenAI({
    apiKey,
    timeout: 25_000, // 25s — dentro do limite padrão Vercel
    maxRetries: 1,
  });

  const baseMessages = [
    { role: 'system' as const, content: req.system },
    ...req.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const maxTokens = req.maxTokens ?? 1200;
  const temperature = req.temperature ?? 0.4;

  try {
    // Tentativa 1: API padrão com max_tokens (funciona em gpt-4o, gpt-4o-mini, gpt-4.1, 3.5-turbo)
    const completion = await client.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: baseMessages,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || '';
    return { text, provider: 'openai', model };
  } catch (err) {
    const anyErr = err as any;
    const apiMsg: string =
      anyErr?.error?.message || anyErr?.message || '';
    const lower = apiMsg.toLowerCase();

    // Se o erro foi por parâmetro (ex.: modelos novos exigem max_completion_tokens),
    // tenta de novo sem max_tokens.
    if (
      anyErr?.status === 400 &&
      (lower.includes('max_tokens') ||
        lower.includes('max_completion_tokens') ||
        lower.includes('unsupported parameter'))
    ) {
      try {
        const retry = await client.chat.completions.create({
          model,
          temperature,
          messages: baseMessages,
        } as any);
        const text = retry.choices?.[0]?.message?.content?.trim() || '';
        return { text, provider: 'openai', model };
      } catch (retryErr) {
        throw classifyError(retryErr, 'openai');
      }
    }

    throw classifyError(err, 'openai');
  }
}

async function callAnthropic(req: LLMRequest, model: string, apiKey: string): Promise<LLMResponse> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);

    let res: Response;
    try {
      res = await fetch('https://api.anthropic.com/v1/messages', {
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
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const bodyText = await res.text();
      let parsed: any = {};
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        /* keep raw */
      }
      const fakeErr = {
        status: res.status,
        message: parsed?.error?.message || bodyText,
        type: parsed?.error?.type,
      };
      throw classifyError(fakeErr, 'anthropic');
    }

    const data = await res.json();
    const text = (data?.content?.[0]?.text || '').trim();
    return { text, provider: 'anthropic', model };
  } catch (err) {
    if (err instanceof LLMError) throw err;
    throw classifyError(err, 'anthropic');
  }
}

/**
 * Ponto único de chamada a um LLM.
 * Lança LLMError classificado. Caller é responsável por fallback.
 */
export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  const { provider, apiKey, model } = resolveConfig();

  if (!apiKey) {
    throw new LLMError('missing_api_key', 'LLM_API_KEY não configurada no ambiente.');
  }

  if (provider === 'anthropic') {
    return callAnthropic(req, model, apiKey);
  }
  return callOpenAI(req, model, apiKey);
}
