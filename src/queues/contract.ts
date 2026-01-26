import { z } from 'zod';

/**
 * The One Source of Truth for Queue Names.
 * All queues must be registered here.
 */
export enum QueueName {
  EMBEDDING = 'embedding',
  GENERATE_TEXT_REMOTE = 'generate-text-remote',
  GENERATE_TEXT_LOCAL = 'generate-text-local',
  MAINTENANCE = 'maintenance',
  GENESIS = 'genesis',
  COMPILE = 'compile',
  TRANSLATE_ENTITY = 'translate-entity',
}

/**
 * Zod Schemas for Job Data.
 * Defines strictly what goes INTO a job.
 */
export const JobSchemas = {
  [QueueName.EMBEDDING]: z.object({
    entityId: z.string().or(z.number()),
    entityType: z.string(),
    action: z.enum(['upsert', 'delete']),
    sourceType: z.enum(['source-code', 'game-entity', 'manual']).optional(),
  }),
  [QueueName.GENERATE_TEXT_REMOTE]: z.object({
    prompt: z.string(),
    targetUid: z.string(),
    targetId: z.string().or(z.number()),
    field: z.string(),
  }),
  [QueueName.GENERATE_TEXT_LOCAL]: z.object({
    prompt: z.string(),
    targetUid: z.string(),
    targetId: z.string().or(z.number()),
    field: z.string(),
    model: z.string().optional(), // Pass enum value
  }),
  [QueueName.MAINTENANCE]: z.object({
    task: z.string(),
    target: z.string().optional(),
  }),
  [QueueName.GENESIS]: z.object({
    type: z.enum(['atoms', 'molecules', 'compounds', 'blueprints', 'all']),
    clean: z.boolean().optional().default(false),
  }),
  [QueueName.COMPILE]: z.object({
    phase: z.string().optional(),
    targetUid: z.string().optional(),
    targetId: z.string().optional(),
  }),
  [QueueName.TRANSLATE_ENTITY]: z.object({
    contentType: z.string(),
    documentId: z.string(),
    targetLocales: z.array(z.string()).optional(),
  }),
};

/**
 * Derived Types for Job Payloads.
 * Use these across the app to ensure type safety.
 */
export type JobPayloads = {
  [K in QueueName]: z.infer<(typeof JobSchemas)[K]>;
};

/**
 * Job Return Types.
 * What does the worker return?
 */
export interface JobResults {
  [QueueName.EMBEDDING]: { success: boolean; vectorId?: string; error?: string };
  [QueueName.GENERATE_TEXT_REMOTE]: { success: boolean; text?: string; error?: string };
  [QueueName.GENERATE_TEXT_LOCAL]: { success: boolean; text?: string; error?: string };
  [QueueName.MAINTENANCE]: { processed: number };
  [QueueName.GENESIS]: { success: boolean; entriesProcessed: number; error?: string };
  [QueueName.COMPILE]: { success: boolean; compiledCount: number; error?: string };
  [QueueName.TRANSLATE_ENTITY]: { success: boolean; locale?: string; error?: string };
}

/**
 * Configuration Types
 */
export interface QueueSettings {
  retryAttempts?: number;
  retryDelay?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
  timeout?: number;
  rateLimit?: number;
  maxMemoryMB?: number;
  maxCpuPercent?: number;
}

export interface QueueConfigItem {
  queueName: string;
  enabled: boolean;
  concurrency: number;
  settings: QueueSettings;
}

export interface QueueConfiguration {
  globalEnabled: boolean;
  queues: QueueConfigItem[];
}
