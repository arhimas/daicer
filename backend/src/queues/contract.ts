import { z } from 'zod';

/**
 * The One Source of Truth for Queue Names.
 * All queues must be registered here.
 */
export enum QueueName {
  EMBEDDING = 'embedding',
  GENERATE_IMAGE = 'generate-image',
  GENERATE_TEXT = 'generate-text',
  MAINTENANCE = 'maintenance',
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
  [QueueName.GENERATE_IMAGE]: z.object({
    prompt: z.string(),
    targetUid: z.string(),
    targetId: z.string().or(z.number()),
    field: z.string().optional().default('image'),
  }),
  [QueueName.GENERATE_TEXT]: z.object({
    prompt: z.string(),
    targetUid: z.string(),
    targetId: z.string().or(z.number()),
    field: z.string(),
  }),
  [QueueName.MAINTENANCE]: z.object({
    task: z.string(),
    target: z.string().optional(),
  }),
};

/**
 * Derived Types for Job Payloads.
 * Use these across the app to ensure type safety.
 */
export type JobPayloads = {
  [K in QueueName]: z.infer<typeof JobSchemas[K]>;
};

/**
 * Job Return Types.
 * What does the worker return?
 */
export interface JobResults {
  [QueueName.EMBEDDING]: { success: boolean; vectorId?: string; error?: string };
  [QueueName.GENERATE_IMAGE]: { success: boolean; assetId?: number; error?: string };
  [QueueName.GENERATE_TEXT]: { success: boolean; text?: string; error?: string };
  [QueueName.MAINTENANCE]: { processed: number };
}
