import { z } from 'zod';
import {} from '@/features/genesis-core/data/schemas/common-schemas';

// Schema matching what monster-loader.ts expects
export const MonsterBlueprintSchema = z.object({
  slug: z.string(),
  name: z.string(),
  size: z.string(),
  type: z.string(),
  subtype: z.string().optional(),
  alignment: z.string(),
  ac: z.number(),
  hp: z.number(),
  hit_dice: z.string(),
  speed: z.object({
    walk: z.string().optional(),
    fly: z.string().optional(),
    swim: z.string().optional(),
    climb: z.string().optional(),
    burrow: z.string().optional(),
  }),
  stats: z.object({
    strength: z.number(),
    dexterity: z.number(),
    constitution: z.number(),
    intelligence: z.number(),
    wisdom: z.number(),
    charisma: z.number(),
  }),
  challenge_rating: z.number(),
  xp: z.number(),
  proficiencies: z
    .array(
      z.object({
        name: z.string(), // "Skill: Perception"
        value: z.number(),
      })
    )
    .optional(),
  damage_vulnerabilities: z.array(z.string()).optional(),
  damage_resistances: z.array(z.string()).optional(),
  damage_immunities: z.array(z.string()).optional(),
  condition_immunities: z.array(z.string()).optional(), // Loader mostly ignores these or expects strings
  languages: z.array(z.string()).optional(), // Loader expects array or string? Schema says string in Source, Loader might expect array.
  special_abilities: z
    .array(
      z.object({
        name: z.string(),
        desc: z.string(),
      })
    )
    .optional(),
  actions: z
    .array(
      z.object({
        name: z.string(),
        desc: z.string(),
        attack_bonus: z.number().optional(),
        damage: z
          .array(
            z.object({
              damage_type: z.object({ name: z.string() }).optional(),
              damage_dice: z.string().optional(),
            })
          )
          .optional(),
        dc: z
          .object({
            dc_type: z.object({ name: z.string() }),
            dc_value: z.number().optional(),
            success_type: z.string().optional(),
          })
          .optional(),
        usage: z.any().optional(),
        type: z.string().optional(), // "Melee Weapon Attack"
      })
    )
    .optional(),
  legendary_actions: z
    .array(
      z.object({
        name: z.string(),
        desc: z.string(),
      })
    )
    .optional(),
  environment: z.array(z.string()).optional(),
  is_legendary: z.boolean().optional(),
});

export type MonsterBlueprint = z.infer<typeof MonsterBlueprintSchema>;
