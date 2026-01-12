import { z } from 'zod';

// --- Primitives ---
export const StatBlockSchema = z.object({
  strength: z.number().default(10),
  dexterity: z.number().default(10),
  constitution: z.number().default(10),
  intelligence: z.number().default(10),
  wisdom: z.number().default(10),
  charisma: z.number().default(10),
  passivePerception: z.number().default(10),
  // Optional/Derived
  initiativeBonus: z.number().optional().default(0),
});

export const DamageEffectSchema = z.object({
  type: z.literal('damage'),
  subtype: z.string().optional(), // e.g. 'fire'
  dice: z.string(), // e.g. '1d6'
  flat: z.number().optional(),
});

export const ConditionEffectSchema = z.object({
  type: z.literal('apply_condition'),
  subtype: z.string(), // Condition name
  duration: z.number().optional(),
});

export const HealingEffectSchema = z.object({
  type: z.literal('healing'),
  dice: z.string().optional(),
  flat: z.number().optional(),
});

export const RuntimeEffectSchema = z.discriminatedUnion('type', [
  DamageEffectSchema,
  ConditionEffectSchema,
  HealingEffectSchema,
]);

export const RuntimeActionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  range: z
    .object({
      type: z.enum(['melee', 'ranged', 'touch', 'self']).optional(),
      value: z.number().optional(),
    })
    .optional(),
  attack: z
    .object({
      bonus: z.number(),
      type: z.string().optional(),
      critRange: z.number().optional(),
    })
    .optional(),
  save: z
    .object({
      attribute: z.string(),
      dc: z.number(),
      effect: z.string().optional(),
    })
    .optional(),
  effects: z.array(RuntimeEffectSchema).optional(),
  cost: z
    .object({
      type: z.enum(['action_economy', 'slot', 'resource']),
      amount: z.number(),
      actionType: z.enum(['action', 'bonus', 'reaction']),
      resourceId: z.string().optional(),
    })
    .optional(),
});

// --- Entities ---
export const EntitySchema = z.object({
  // Identity
  id: z.string(), // Document ID
  name: z.string(),
  type: z.enum(['player', 'npc', 'monster', 'object']),

  // Position (Default 0,0,0 if missing)
  position: z
    .object({
      x: z.number().default(0),
      y: z.number().default(0),
      z: z.number().default(0),
    })
    .default({ x: 0, y: 0, z: 0 }),

  // Vitals
  hp: z.number(),
  maxHp: z.number(),
  armorClass: z.number(),
  speed: z
    .union([z.number(), z.object({ walk: z.number() }).passthrough()])
    .transform((val) => (typeof val === 'number' ? { walk: val } : val)),

  // Leveling
  level: z.number().optional().default(1),

  // Stats
  stats: StatBlockSchema,

  // Capabilities
  actions: z.array(RuntimeActionSchema).default([]),
  features: z.array(z.any()).default([]), // TODO: Strict Feature Schema
  conditions: z.array(z.any()).default([]), // TODO: Strict Condition Schema

  // Resistances
  resistances: z.array(z.string()).default([]),
  immunities: z.array(z.string()).default([]),
  vulnerabilities: z.array(z.string()).default([]),

  // Meta
  color: z.string().default('#ffffff'),
  visionRadius: z.number().default(30),

  // Embed the raw sheet for reference, but type it as 'unknown' or 'any'
  // because we don't want to validate the *entire* deep sheet here, just the Engine essential view.
  // Actually, let's make it optional unknown.
  sheet: z.unknown().optional(),
});

export type EngineEntity = z.infer<typeof EntitySchema>;
export type EngineAction = z.infer<typeof RuntimeActionSchema>;
export type EngineStats = z.infer<typeof StatBlockSchema>;

// --- Blueprints (DB Read) ---
export const BlueprintSchema = z
  .object({
    documentId: z.string(),
    name: z.string(),
    stats: StatBlockSchema.partial().default({}),
    hp: z.number().optional(),
    ac: z.number().optional(),
    speed: z.union([z.number(), z.object({ walk: z.number() }).passthrough()]).optional(),
    level: z.number().optional(),
    challenge_rating: z.number().optional(),
    xp: z.number().optional(),

    // Relations
    actions: z.array(z.object({ documentId: z.string() }).passthrough()).optional(),
    features: z.array(z.object({ documentId: z.string() }).passthrough()).optional(),
    proficiencies: z.array(z.object({ documentId: z.string() }).passthrough()).optional(),
    languages: z.array(z.object({ documentId: z.string() }).passthrough()).optional(),
    traits: z.array(z.object({ documentId: z.string() }).passthrough()).optional(),

    // Inventory Component
    inventory: z
      .array(
        z.object({
          item: z
            .object({
              documentId: z.string(),
              type: z.string().optional(),
              equipment_data: z.record(z.string(), z.any()).optional(),
            })
            .passthrough()
            .optional(),
          quantity: z.number().optional(),
          slot: z.string().optional(),
          isEquipped: z.boolean().optional(),
        })
      )
      .optional()
      .default([]),
  })
  .passthrough(); // Allow extra fields from Strapi we don't strict-check yet

export const SpawnPayloadSchema = z.object({
  type: z.enum(['monster', 'player', 'character', 'npc']),
  blueprintId: z.union([z.string(), z.number()]),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number().default(0),
  }),
  ownerId: z.string().optional(),
});
