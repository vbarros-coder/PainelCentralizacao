/**
 * LLM Provider Abstraction
 *
 * Providers suportados:
 *   - openai     (pago)
 *   - anthropic  (pago)
 *   - groq       (grátis - https://console.groq.com)
 *   - gemini     (grátis - https://aistudio.google.com/app/apikey)
 *
 * Uso exclusivamente server-side. A API key é lida de variáveis de ambiente
 * e NUNCA é exposta ao frontend.
 *
 * Env vars PRIMÁRIAS (obrigatórias):
 *   LLM_PROVIDER  -> "openai" | "anthropic" | "groq" | "gemini" (default: "openai")
 *   LLM_MODEL     -> ex: "llama-3.3-70b-versatile", "gemini-2.0-flash"
 *   LLM_API_KEY   -> chave do provider primário
 *
 * Env vars FALLBACK (opcionais — se o primário falhar, tenta o secundário):
 *   LLM_FALLBACK_PROVIDER
 *   LLM_FALLBACK_MODEL
 *   LLM_FALLBACK_API_KEY
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

export type LLMProvider = 'openai' | 'anthropic' | 'groq' | 'gemini';

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

// Default model por provider quando LLM_MODEL não é definido
const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-latest',
  groq: 'llama-3.3-70b-versatile',
  gemini: 'gemini-2.0-flash',
};

function normalizeProvider(val: string | undefined): LLMProvider {
  const v = (val || 'openai').trim().toLowerCase();
  if (v === 'groq' || v === 'gemini' || v === 'anthropic' || v === 'openai') return v;
  return 'openai';
}

interface PrimaryConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
}

function resolveConfig(): PrimaryConfig {
  const provider = normalizeProvider(process.env.LLM_PROVIDER);
  const apiKey = (process.env.LLM_API_KEY || '').trim();
  const rawModel = (process.env.LLM_MODEL || '').trim();
  const model = rawModel || DEFAULT_MODELS[provider];
  return { provider, apiKey, model };
}

function resolveFallbackConfig(): PrimaryConfig | null {
  const raw = (process.env.LLM_FALLBACK_PROVIDER || '').trim();
  const apiKey = (process.env.LLM_FALLBACK_API_KEY || '').trim();
  if (!raw || !apiKey) return null;
  const provider = normalizeProvider(raw);
  const rawModel = (process.env.LLM_FALLBACK_MODEL || '').trim();
  const model = rawModel || DEFAULT_MODELS[provider];
  return { provider, apiKey, model };
}

export function isLLMConfigured(): boolean {
  return Boolean((process.env.LLM_API_KEY || '').trim());
}

export function getLLMInfo() {
  const primary = resolveConfig();
  const fallback = resolveFallbackConfig();
  return {
    configured: Boolean(primary.apiKey),
    provider: primary.provider,
    model: primary.model,
    apiKeyLength: primary.apiKey ? primary.apiKey.length : 0,
    apiKeyPrefix: primary.apiKey ? primary.apiKey.slice(0, 7) : '',
    fallback: fallback
      ? {
          provider: fallback.provider,
          model: fallback.model,
          apiKeyLength: fallback.apiKey.length,
        }
      : null,
  };
}

/**
 * Classifica um erro arbitrário do provider em LLMErrorCode.
 */
function classifyError(err: unknown, provider: string): LLMError {
  const anyErr = err as any;

  const status: number | undefined =
    anyErr?.status ?? anyErr?.response?.status ?? anyErr?.statusCode;

  const apiMessage: string | undefined =
    anyErr?.error?.message ??
    anyErr?.response?.data?.error?.message ??
    anyErr?.response?.body?.error?.message;

  let serializedFallback = '';
  if (!apiMessage && !anyErr?.message) {
    try {
      serializedFallback = JSON.stringify({
        status: anyErr?.status,
        code: anyErr?.code,
        type: anyErr?.type,
        error: anyErr?.error,
      });
    } catch {
      serializedFallback = String(err);
    }
  }

  const rawMsg: string = apiMessage || anyErr?.message || serializedFallback || String(err);

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
    lower.includes('insufficient_quota') ||
    lower.includes('exceeded your current quota')
  ) {
    return new LLMError('billing_error', 'Problema de billing/cota no provider.', status, rawMsg);
  }
  if (status === 429 || lower.includes('rate limit')) {
    return new LLMError('rate_limit', 'Rate limit atingido no provider.', status, rawMsg);
  }
  if (
    status === 404 ||
    lower.includes('invalid model') ||
    lower.includes('model_not_found') ||
    lower.includes('does not have access to model') ||
    (lower.includes('model') && (lower.includes('not found') || lower.includes('does not exist')))
  ) {
    return new LLMError(
      'model_not_found',
      'Modelo configurado não existe ou não está habilitado.',
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
  if (status === 400) {
    return new LLMError(
      'provider_error',
      `Requisição rejeitada pelo ${provider} (400): ${rawMsg || '[sem mensagem]'}`,
      status,
      rawMsg
    );
  }
  if (status && status >= 500) {
    return new LLMError('provider_error', `Erro interno (${status}): ${rawMsg}`, status, rawMsg);
  }
  return new LLMError(
    'unknown_error',
    rawMsg || `Erro desconhecido chamando ${provider}.`,
    status,
    rawMsg
  );
}

// ==========================================
// PROVIDER: OpenAI (e compatíveis)
// ==========================================

/**
 * Função interna que chama qualquer endpoint compatível com OpenAI.
 * Groq é 100% OpenAI-compatible, só muda a baseURL.
 */
async function callOpenAICompatible(
  req: LLMRequest,
  model: string,
  apiKey: string,
  providerName: string,
  baseURL?: string
): Promise<LLMResponse> {
  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: 25_000,
    maxRetries: 1,
  });

  const baseMessages = [
    { role: 'system' as const, content: req.system },
    ...req.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const maxTokens = req.maxTokens ?? 1200;
  const temperature = req.temperature ?? 0.4;

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: baseMessages,
    });
    const text = completion.choices?.[0]?.message?.content?.trim() || '';
    return { text, provider: providerName, model };
  } catch (err) {
    const anyErr = err as any;
    const apiMsg: string = anyErr?.error?.message || anyErr?.message || '';
    const lower = apiMsg.toLowerCase();

    // Retry sem max_tokens se o provider reclamar
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
        return { text, provider: providerName, model };
      } catch (retryErr) {
        throw classifyError(retryErr, providerName);
      }
    }
    throw classifyError(err, providerName);
  }
}

async function callOpenAI(req: LLMRequest, model: string, apiKey: string): Promise<LLMResponse> {
  return callOpenAICompatible(req, model, apiKey, 'openai');
}

async function callGroq(req: LLMRequest, model: string, apiKey: string): Promise<LLMResponse> {
  // Groq é totalmente compatível com a API da OpenAI
  return callOpenAICompatible(req, model, apiKey, 'groq', 'https://api.groq.com/openai/v1');
}

// ==========================================
// PROVIDER: Anthropic
// ==========================================

async function callAnthropic(req: LLMRequest, model: string, apiKey: string): Promise<LLMResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);

  try {
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
      signal: controller.signal,
    });

    if (!res.ok) {
      const bodyText = await res.text();
      let parsed: any = {};
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        /* keep raw */
      }
      throw classifyError(
        { status: res.status, message: parsed?.error?.message || bodyText, type: parsed?.error?.type },
        'anthropic'
      );
    }

    const data = await res.json();
    const text = (data?.content?.[0]?.text || '').trim();
    return { text, provider: 'anthropic', model };
  } catch (err) {
    if (err instanceof LLMError) throw err;
    throw classifyError(err, 'anthropic');
  } finally {
    clearTimeout(timer);
  }
}

// ==========================================
// PROVIDER: Google Gemini
// ==========================================

async function callGemini(req: LLMRequest, model: string, apiKey: string): Promise<LLMResponse> {
  // Gemini API: POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=...
  // System é enviado como systemInstruction. Messages em "contents" com role "user"/"model".
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents = req.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.system }] },
        contents,
        generationConfig: {
          temperature: req.temperature ?? 0.4,
          maxOutputTokens: req.maxTokens ?? 1200,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const bodyText = await res.text();
      let parsed: any = {};
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        /* keep raw */
      }
      throw classifyError(
        {
          status: res.status,
          message: parsed?.error?.message || bodyText,
          type: parsed?.error?.status,
        },
        'gemini'
      );
    }

    const data = await res.json();
    const text =
      (data?.candidates?.[0]?.content?.parts || [])
        .map((p: any) => p?.text || '')
        .join('')
        .trim() || '';
    return { text, provider: 'gemini', model };
  } catch (err) {
    if (err instanceof LLMError) throw err;
    throw classifyError(err, 'gemini');
  } finally {
    clearTimeout(timer);
  }
}

// ==========================================
// DISPATCHER
// ==========================================

async function dispatch(
  req: LLMRequest,
  cfg: PrimaryConfig
): Promise<LLMResponse> {
  switch (cfg.provider) {
    case 'anthropic':
      return callAnthropic(req, cfg.model, cfg.apiKey);
    case 'groq':
      return callGroq(req, cfg.model, cfg.apiKey);
    case 'gemini':
      return callGemini(req, cfg.model, cfg.apiKey);
    case 'openai':
    default:
      return callOpenAI(req, cfg.model, cfg.apiKey);
  }
}

/**
 * Ponto único de chamada. Tenta provider primário; se falhar com erro
 * "recuperável" (billing, rate_limit, provider_error, network_error, timeout, unknown_error),
 * e houver LLM_FALLBACK_* configurado, tenta o fallback automaticamente.
 * Lança LLMError se tudo falhar.
 */
export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  const primary = resolveConfig();

  if (!primary.apiKey) {
    throw new LLMError('missing_api_key', 'LLM_API_KEY não configurada no ambiente.');
  }

  try {
    return await dispatch(req, primary);
  } catch (err) {
    const fallback = resolveFallbackConfig();
    if (!fallback) throw err;

    const recoverable: LLMErrorCode[] = [
      'billing_error',
      'rate_limit',
      'provider_error',
      'network_error',
      'timeout',
      'unknown_error',
      'model_not_found',
    ];

    if (err instanceof LLMError && recoverable.includes(err.code)) {
      console.warn(
        `[LLM] primário (${primary.provider}/${primary.model}) falhou com ${err.code}. ` +
          `Tentando fallback (${fallback.provider}/${fallback.model}).`
      );
      try {
        return await dispatch(req, fallback);
      } catch (fbErr) {
        // Se o fallback também falhar, propaga o erro ORIGINAL do primário
        // para preservar o diagnóstico principal.
        console.error(
          `[LLM] fallback (${fallback.provider}) também falhou: ${
            fbErr instanceof Error ? fbErr.message : 'unknown'
          }`
        );
        throw err;
      }
    }

    throw err;
  }
}
