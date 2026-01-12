import { z } from 'zod';

// --- Shared Primitives ---
const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().default(0),
});

// --- Command Payloads ---

export const MoveCommandSchema = z.object({
  type: z.literal('MOVE'),
  timestamp: z.number().default(() => Date.now()),
  payload: z.object({
    actorId: z.string(),
    targetPosition: PositionSchema,
    mode: z.enum(['walk', 'fly', 'swim', 'teleport']).default('walk'),
    path: z.array(PositionSchema).optional(), // Optional optimistic path
  }),
});

export const AttackCommandSchema = z.object({
  type: z.literal('ATTACK'),
  timestamp: z.number().default(() => Date.now()),
  payload: z.object({
    actorId: z.string(),
    targetId: z.string(),
    weaponId: z.string().optional(), // If using a specific weapon item
    actionId: z.string().optional(), // If using a specific action ID (e.g. from StatBlock)
    offhand: z.boolean().optional(),
  }),
});

export const CastSpellCommandSchema = z.object({
  type: z.literal('CAST_SPELL'),
  timestamp: z.number().default(() => Date.now()),
  payload: z.object({
    actorId: z.string(),
    spellId: z.string(),
    targetId: z.string().optional(),
    targetPosition: PositionSchema.optional(),
    level: z.number().optional(), // Upcasting
  }),
});

export const InteractCommandSchema = z.object({
  type: z.literal('INTERACT'),
  timestamp: z.number().default(() => Date.now()),
  payload: z.object({
    actorId: z.string(),
    targetId: z.string(),
    interactionType: z.string().default('use'),
  }),
});

export const ModifyTerrainCommandSchema = z.object({
  type: z.literal('MODIFY_TERRAIN'),
  timestamp: z.number().default(() => Date.now()),
  payload: z.object({
    actorId: z.string(),
    center: PositionSchema,
    radius: z.number().default(0),
    type: z.string(), // Block Type
    mode: z.enum(['set', 'add', 'remove']).default('set'),
  }),
});

export const DropItemCommandSchema = z.object({
  type: z.literal('DROP_ITEM'),
  timestamp: z.number().default(() => Date.now()),
  payload: z.object({
    actorId: z.string(),
    itemComponentId: z.string(),
    quantity: z.number().min(1).optional(),
  }),
});

export const PickupItemCommandSchema = z.object({
  type: z.literal('PICKUP_ITEM'),
  timestamp: z.number().default(() => Date.now()),
  payload: z.object({
    actorId: z.string(),
    targetId: z.string(), // The Loot Pile Entity ID
  }),
});

export const ThrowItemCommandSchema = z.object({
  type: z.literal('THROW_ITEM'),
  timestamp: z.number().default(() => Date.now()),
  payload: z.object({
    actorId: z.string(),
    itemComponentId: z.string(),
    targetEntityId: z.string().optional(),
    targetPosition: PositionSchema,
  }),
});

// --- Union ---
export const EngineCommandSchema = z.discriminatedUnion('type', [
  MoveCommandSchema,
  AttackCommandSchema,
  CastSpellCommandSchema,
  InteractCommandSchema,
  ModifyTerrainCommandSchema,
  DropItemCommandSchema,
  PickupItemCommandSchema,
  ThrowItemCommandSchema,
]);

export type EngineCommand = z.infer<typeof EngineCommandSchema>;
export type MoveCommand = z.infer<typeof MoveCommandSchema>;
export type AttackCommand = z.infer<typeof AttackCommandSchema>;
export type CastSpellCommand = z.infer<typeof CastSpellCommandSchema>;
export type InteractCommand = z.infer<typeof InteractCommandSchema>;
export type ModifyTerrainCommand = z.infer<typeof ModifyTerrainCommandSchema>;
export type DropItemCommand = z.infer<typeof DropItemCommandSchema>;
export type PickupItemCommand = z.infer<typeof PickupItemCommandSchema>;
export type ThrowItemCommand = z.infer<typeof ThrowItemCommandSchema>;
