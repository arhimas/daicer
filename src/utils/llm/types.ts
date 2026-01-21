/**
 * Shared types and configurations for LLM services
 */

import type { Language } from '../../api/game/src/engine/types';

/**
 * Gemini model identifiers
 */
export enum GeminiModel {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
}

/**
 * Base configuration for Gemini models
 */
export interface GeminiConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Text generation configuration
 */
export interface TextGenConfig extends GeminiConfig {
  model?: GeminiModel.FLASH | GeminiModel.PRO;
  language?: Language;
  enableFallback?: boolean;
  /** User ID for tracking purposes */
  userId?: string;
  /** Custom tags for grouping traces in LangSmith */
  tags?: string[];
  /** Additional metadata for traces */
  metadata?: Record<string, unknown>;
}

export const DEFAULT_TEXT_CONFIG: Required<GeminiConfig> = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.8,
  topK: 40,
  timeout: 0,
};

/**
 * Local model identifiers
 * STRICT: Gemma 3 / Gemma 3n ONLY.
 */
export enum LocalModel {
  GEMMA_3_27B_IT = 'google/gemma-3-27b-it',
  GEMMA_3_12B_IT = 'google/gemma-3-12b-it',
  GEMMA_3_4B_IT = 'google/gemma-3-4b-it',
  GEMMA_3_1B_IT = 'google/gemma-3-1b-it',
  GEMMA_3N_1B_IT = 'google/gemma-3n-1b-it',
}

/**
 * Configuration for Local models
 */
export interface LocalConfig {
  model?: LocalModel;
  maxTokens?: number;
  temperature?: number;
  quantization?: 'q8' | 'q4' | 'fp16' | 'int8';
  device?: 'cpu' | 'gpu' | 'auto';
}
