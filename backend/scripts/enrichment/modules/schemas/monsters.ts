import { z } from 'zod';
import { FeatureSchema } from './core';

const MonsterActionSchema = z.object({
  name: z.string(),
  type: z.enum(['melee_weapon', 'ranged_weapon', 'spell', 'ability', 'other']).default('other'),
  activation_type: z.enum(['action', 'bonus_action', 'reaction', 'legendary', 'mythic', 'lair']).default('action'),
  description: z.string().optional().default(''),
  toHit: z.number().int().optional().nullable(),
  range: z.number().int().optional().nullable().describe('Distance in Feet (integer)'),
  reach: z.number().int().optional().nullable().describe('Reach in Feet (integer)'),
  damage_dice: z.number().int().optional().nullable().describe('Number of dice (e.g. 2 for 2d6)'),
  damage_dice_value: z.number().int().optional().nullable().describe('Face value of dice (e.g. 6 for 2d6)'),
  damage_bonus: z.number().int().optional().nullable(),
  damage_type: z
    .enum([
      'Acid',
      'Bludgeoning',
      'Cold',
      'Fire',
      'Force',
      'Lightning',
      'Necrotic',
      'Piercing',
      'Poison',
      'Psychic',
      'Radiant',
      'Slashing',
      'Thunder',
    ])
    .or(z.string())
    .optional()
    .nullable(),
  save_dc: z.number().int().optional().nullable(),
  save_attribute: z
    .enum(['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha', 'str', 'dex', 'con', 'int', 'wis', 'cha'])
    .optional()
    .nullable(),
  is_multiattack: z.boolean().default(false),
});

export const MonsterEnrichmentSchema = z.object({
  actions: z.array(MonsterActionSchema).default([]),
  legendary_actions: z.array(MonsterActionSchema).optional().default([]),
  reactions: z.array(FeatureSchema).optional().default([]),
  features: z.array(FeatureSchema).optional().default([]),
});
