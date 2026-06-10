function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY?.trim() || '';
  if (!key) {
    throw new Error('Set OPENROUTER_API_KEY in .env.local');
  }
  return key;
}

const FLASH_MODEL = process.env.OPENROUTER_FLASH_MODEL?.trim() || 'google/gemma-4-31b-it:free';
const PRO_MODEL = process.env.OPENROUTER_PRO_MODEL?.trim() || 'google/gemma-4-31b-it:free';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableError(err: unknown): boolean {
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

async function callOpenRouter(model: string, prompt: string): Promise<Record<string, unknown>> {
  const apiKey = getApiKey();
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'IdeaForge',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_object',
      },
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const choice = result.choices?.[0];
  if (!choice) {
    throw new Error('No content returned from OpenRouter response');
  }

  const text = choice.message?.content || '';
  const cleaned = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch (err) {
    console.error('Failed to parse model JSON content:', text);
    throw new Error('Response returned by model was not valid JSON');
  }
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
      const retry = attempt < MAX_ATTEMPTS - 1 && isRetryableError(error);
      if (!retry) {
        console.error(`OpenRouter ${label} error (no retry):`, error);
        throw error instanceof Error ? error : new Error('AI generation failed');
      }
      const delay =
        BASE_BACKOFF_MS * Math.pow(1.85, attempt) + Math.floor(Math.random() * 1200);
      console.warn(`OpenRouter ${label} rate-limited / transient — retry ${attempt + 1}/${MAX_ATTEMPTS} in ${Math.round(delay)}ms`);
      await sleep(delay);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('AI generation failed');
}

export async function generateWithFlash(prompt: string): Promise<Record<string, unknown>> {
  return withRetries('flash', async () => {
    return callOpenRouter(FLASH_MODEL, prompt);
  });
}

export async function generateWithPro(prompt: string): Promise<Record<string, unknown>> {
  return withRetries('pro', async () => {
    return callOpenRouter(PRO_MODEL, prompt);
  });
}
