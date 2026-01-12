import { z } from 'zod';

// --- Shared ---
const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().default(0),
});

// --- Event Payloads ---

export const EntityMovedEventSchema = z.object({
  type: z.literal('ENTITY_MOVED'),
  timestamp: z.number(),
  room: z.string(),
  actor: z.string(),
  payload: z.object({
    from: PositionSchema,
    to: PositionSchema,
    path: z.array(PositionSchema).optional(),
    cost: z.number().optional(),
    mode: z.enum(['walk', 'fly', 'teleport']).default('walk'),
  }),
});

export const AttackResultEventSchema = z.object({
  type: z.literal('ATTACK_RESULT'),
  timestamp: z.number(),
  room: z.string(),
  actor: z.string(),
  payload: z.object({
    targetId: z.string(),
    actionId: z.string().optional(),
    roll: z.number(),
    total: z.number(), // Roll + Bonus
    isHit: z.boolean(),
    isCrit: z.boolean().default(false),
    damage: z.number().default(0),
  }),
});

export const DamageDealtEventSchema = z.object({
  type: z.literal('DAMAGE_DEALT'),
  timestamp: z.number(),
  room: z.string(),
  actor: z.string().optional(), // Source of damage
  payload: z.object({
    targetId: z.string(),
    amount: z.number(),
    type: z.string().default('physical'),
    source: z.string().optional(), // "Longsword", "Fireball"
    isLethal: z.boolean().default(false),
  }),
});

export const EntityDeathEventSchema = z.object({
  type: z.literal('ENTITY_DEATH'),
  timestamp: z.number(),
  room: z.string(),
  actor: z.string(), // The entity that died
  payload: z.object({
    killerId: z.string().optional(),
    position: PositionSchema,
  }),
});

export const ItemDroppedEventSchema = z.object({
  type: z.literal('ITEM_DROPPED'),
  timestamp: z.number(),
  room: z.string(),
  actor: z.string(),
  payload: z.object({
    itemId: z.string(),
    lootEntityId: z.string().optional(),
    position: PositionSchema,
  }),
});

export const TerrainModifiedEventSchema = z.object({
  type: z.literal('TERRAIN_MODIFIED'),
  timestamp: z.number(),
  room: z.string(),
  actor: z.string(),
  payload: z.object({
    center: PositionSchema,
    radius: z.number(),
    blockType: z.string(),
    count: z.number(),
  }),
});

// --- Union ---
export const GameEventSchema = z.discriminatedUnion('type', [
  EntityMovedEventSchema,
  AttackResultEventSchema,
  DamageDealtEventSchema,
  EntityDeathEventSchema,
  ItemDroppedEventSchema,
  TerrainModifiedEventSchema,
]);

export type GameEvent = z.infer<typeof GameEventSchema>;
