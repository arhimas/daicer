/**
 * Centralized Gemini model factory using LangChain
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GeminiModel, GeminiConfig, DEFAULT_TEXT_CONFIG } from './types';
import { z } from 'zod';

/**
 * Get Gemini API key from environment.
 * Throws if GEMINI_API_KEY is not set.
 */
function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return apiKey;
}

/**
 * Creates a configured Gemini model instance using LangChain.
 * 
 * @param model - The specific Gemini model version to use.
 * @param config - Configuration options (temperature, max tokens, etc).
 * @returns Configured ChatGoogleGenerativeAI instance.
 */
export function getGeminiModel(
  model: GeminiModel = GeminiModel.FLASH,
  config: GeminiConfig = {}
): ChatGoogleGenerativeAI {
  const apiKey = getApiKey();

  const finalConfig = {
    ...DEFAULT_TEXT_CONFIG,
    ...config,
  };

  return new ChatGoogleGenerativeAI({
    apiKey,
    model,
    maxOutputTokens: finalConfig.maxTokens,
    temperature: finalConfig.temperature,
    topP: finalConfig.topP,
    topK: finalConfig.topK,
    // Ensure we can use safety settings if needed
  });
}

/**
 * Creates a Gemini model configured to return structured JSON adhering to a Zod schema.
 * 
 * @param schema - Zod schema defining the expected output structure.
 * @param model - Gemini model version.
 * @param config - Configuration options.
 * @returns Runnable model that outputs typed objects.
 */
export function getStructuredGeminiModel(
  schema: z.ZodType,
  model: GeminiModel = GeminiModel.FLASH,
  config: GeminiConfig = {}
) {
  const rawModel = getGeminiModel(model, config);
  return rawModel.withStructuredOutput(schema);
}

// Local interface for common error shapes (Axios, GoogleGenerativeAI, etc)
interface ExtendedError extends Error {
  status?: number;
  code?: string | number;
  response?: {
    status?: number;
    data?: unknown;
  };
}

export function extractErrorDetails(error: unknown): string {
  if (!error) return 'Unknown error';

  if (error instanceof Error) {
    const errExt = error as ExtendedError;
    const status = errExt.status || errExt.response?.status;
    const code = errExt.code;
    const details = errExt.response?.data;

    const parts = [
      error.name,
      status ? `status=${status}` : null,
      code ? `code=${code}` : null,
      error.message ? `message=${error.message}` : null,
      details ? `details=${JSON.stringify(details)}` : null,
    ].filter(Boolean);

    return parts.join(' | ');
  }

  return typeof error === 'string' ? error : JSON.stringify(error);
}

export function getFlashModel(config?: GeminiConfig): ChatGoogleGenerativeAI {
  return getGeminiModel(GeminiModel.FLASH, config);
}

export function getProModel(config?: GeminiConfig): ChatGoogleGenerativeAI {
  return getGeminiModel(GeminiModel.PRO, config);
}
