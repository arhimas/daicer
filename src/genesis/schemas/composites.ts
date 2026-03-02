import { z } from 'zod';
import { Slug, RichText, RelationMany, SizeEnum } from '@/genesis/schemas/common';
import { StatsSchema } from '@/genesis/schemas/components';

export const EntitySchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    description: RichText,

    size: SizeEnum.default('Medium'),
    type: z.string().default('beast'), // e.g. "humanoid", "fiend"
    alignment: z.string().optional(), // "chaotic evil"

    level: z.number().int().default(1),
    challenge_rating: z.number().default(0),
    xp: z.number().int().default(0),

    ac: z.number().int().default(10),
    hp: z.number().int().default(4),
    hit_dice: z.string().optional(), // "1d8"

    stats: StatsSchema,

    features: RelationMany, // Special Abilities
    actions: RelationMany, // Actions (api::action)
    traits: RelationMany, // Racial
    proficiencies: RelationMany,
    languages: RelationMany,

    inventory: z
      .array(
        z.object({
          item: z.string(), // slug of item
          quantity: z.number().int().default(1),
          equipped: z.boolean().default(false),
        })
      )
      .optional(),

    tags: RelationMany,
    blueprint: RelationMany,
    spriteData: z.array(z.string()).optional(),
  })
  .strict();

export type SeedEntity = z.infer<typeof EntitySchema>;
