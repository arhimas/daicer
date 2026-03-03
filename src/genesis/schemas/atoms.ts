import { z } from 'zod';
import { Slug, RichText, RelationMany, RelationOne } from '@/genesis/schemas/common';

export const TraitSchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    description: RichText,
    type: z.enum(['racial', 'feat', 'background', 'monster']).default('racial').optional(),
    races: RelationMany, // Slugs
    proficiencies: RelationMany, // Slugs
  })
  .strict();

export const TagSchema = z
  .object({
    slug: Slug,
    name: z.string(),
    color: z.string().optional(),
    category: z.enum(['general', 'mechanic', 'thematic', 'meta']).default('general'),
  })
  .strict();

export const ProficiencySchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    type: z.enum(['Armor', 'Weapons', 'Tools', "Artisan's Tools", 'Gaming Sets', 'Musical Instruments', 'Vehicles', 'Other', 'Saving Throws', 'Skills']).default('Skills'),
  })
  .strict();

export const RaceSchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    description: RichText,
    speed: z.number().int().default(30),
    size: z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']).default('Medium'),
    traits: RelationMany,
  })
  .strict();

export const TerrainSchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    color: z.string().optional(),
    texture: z.any().optional(), // Map Explorer Texture Grid
    isWalkable: z.boolean().default(true),
    isTransparent: z.boolean().default(false),
    isLiquid: z.boolean().default(false),
    damagePerTick: z.number().default(0),
    luminance: z.number().default(0),
    moisture: z.number().default(0),
    temperature: z.number().default(0),
    tags: RelationMany,
    blueprint: RelationOne,
    spriteData: z.array(z.string()).optional(),
  })
  .strict();

export const EntityZoneSchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    symbol: z.string().max(1).optional(),
    color: z.string().optional(),
    description: RichText.optional(),
    category: z.enum(['Creature', 'Item', 'Structure', 'Effect', 'Terrain']).default('Creature'),
  })
  .strict();

export type SeedTrait = z.infer<typeof TraitSchema>;
export type SeedTag = z.infer<typeof TagSchema>;
export type SeedProficiency = z.infer<typeof ProficiencySchema>;
export type SeedRace = z.infer<typeof RaceSchema>;
export type SeedTerrain = z.infer<typeof TerrainSchema>;
export type SeedEntityZone = z.infer<typeof EntityZoneSchema>;
