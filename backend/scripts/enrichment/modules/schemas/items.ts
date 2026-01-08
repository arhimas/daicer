import { z } from 'zod';

export const WeaponSchema = z.object({
  damage_dice_count: z.number().int().optional().nullable(),
  damage_dice_value: z.number().int().optional().nullable(),
  damage_dice_string: z.string().optional().nullable().describe('e.g. "2d6"'),
  damage_type: z.enum(['Bludgeoning', 'Piercing', 'Slashing']).optional().nullable(),
  range_normal: z.number().int().optional().nullable(),
  range_long: z.number().int().optional().nullable(),
  versatile_damage: z.string().optional().nullable(),
  spells: z.array(z.string()).optional().nullable(),
});

export const MagicItemSchema = z.object({
  rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact']).default('Common'),
  requires_attunement: z.boolean().default(false),
  attunement_description: z.string().optional().nullable(),
  has_charges: z.boolean().default(false),
  max_charges: z.number().int().optional().nullable(),
  recharge_formula: z.string().optional().nullable(),
  recharge_trigger: z.string().optional().nullable(),
});
