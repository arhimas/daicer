import { z } from 'zod';

/**
 * A lightweight Entity Schema for World State replication.
 * Used when sending large lists of entities to the client (e.g. Lobby, Map View)
 * without sending the full Character Sheet.
 */
export const MinEntitySchema = z
  .object({
    id: z.string(),
    documentId: z.string().optional(),
    name: z.string(),
    type: z.string(), // 'player' | 'monster' | 'npc'
    position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    hp: z.number().optional(),
    maxHp: z.number().optional(),
    currentHp: z.number().optional(), // Inconsistency in backend vs frontend usually
    sheet: z.record(z.string(), z.any()).optional(), // The full sheet (Loosened for build perf)
  })
  .passthrough(); // Allow extra props for now
