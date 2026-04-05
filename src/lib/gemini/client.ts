import { GoogleGenerativeAI } from '@google/generative-ai';

function getApiKey(): string {
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    '';
  if (!key) {
    throw new Error(
      'Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY in .env.local (Google AI Studio → API key)'
    );
  }
  return key;
}

/** gemini-2.0-flash was retired for new API keys — use 2.5.x. Override via GEMINI_FLASH_MODEL / GEMINI_PRO_MODEL. */
const FLASH_MODEL =
  process.env.GEMINI_FLASH_MODEL?.trim() || 'gemini-2.5-flash';
const PRO_MODEL = process.env.GEMINI_PRO_MODEL?.trim() || 'gemini-2.5-pro';

const flashConfig = {
  model: FLASH_MODEL,
  generationConfig: {
    responseMimeType: 'application/json' as const,
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
};

const proConfig = {
  model: PRO_MODEL,
  generationConfig: {
    responseMimeType: 'application/json' as const,
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
};

function flashModel() {
  return new GoogleGenerativeAI(getApiKey()).getGenerativeModel(flashConfig);
}

function proModel() {
  return new GoogleGenerativeAI(getApiKey()).getGenerativeModel(proConfig);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableGeminiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const blob = msg + JSON.stringify(err);
  const lower = blob.toLowerCase();
  return (
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('too many requests') ||
    lower.includes('quota') ||
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('econnreset')
  );
}

async function parseGenerateResult(result: Awaited<ReturnType<ReturnType<typeof flashModel>['generateContent']>>) {
  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

const MAX_ATTEMPTS = 8;
const BASE_BACKOFF_MS = 2500;

async function withRetries(
  label: 'flash' | 'pro',
  call: () => Promise<Record<string, unknown>>
): Promise<Record<string, unknown>> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await call();
    } catch (error) {
      lastErr = error;
      const retry = attempt < MAX_ATTEMPTS - 1 && isRetryableGeminiError(error);
      if (!retry) {
        console.error(`Gemini ${label} error (no retry):`, error);
        throw error instanceof Error ? error : new Error('AI generation failed');
      }
      const delay =
        BASE_BACKOFF_MS * Math.pow(1.85, attempt) + Math.floor(Math.random() * 1200);
      console.warn(`Gemini ${label} rate-limited / transient — retry ${attempt + 1}/${MAX_ATTEMPTS} in ${Math.round(delay)}ms`);
      await sleep(delay);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('AI generation failed');
}

export async function generateWithFlash(prompt: string): Promise<Record<string, unknown>> {
  return withRetries('flash', async () => {
    const result = await flashModel().generateContent(prompt);
    return parseGenerateResult(result);
  });
}

export async function generateWithPro(prompt: string): Promise<Record<string, unknown>> {
  return withRetries('pro', async () => {
    const result = await proModel().generateContent(prompt);
    return parseGenerateResult(result);
  });
}
