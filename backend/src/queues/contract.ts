import { z } from 'zod';

/**
 * The One Source of Truth for Queue Names.
 * All queues must be registered here.
 */
export enum QueueName {
  EMBEDDING = 'embedding',
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
  [QueueName.MAINTENANCE]: { processed: number };
}
