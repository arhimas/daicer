import { z } from 'zod';
import { Slug, RichText, RelationMany } from '@/genesis/schemas/common';
import {
  CastingConfigSchema,
  RangeConfigSchema,
  MechanicsConfigSchema,
  DurationConfigSchema,
  DamageInstanceSchema,
  ConditionInstanceSchema,
  EquipmentDataSchema,
} from '@/genesis/schemas/components';

export const SpellSchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    level: z.number().int().min(0).max(9),
    school: z.enum([
      'Abjuration',
      'Conjuration',
      'Divination',
      'Enchantment',
      'Evocation',
      'Illusion',
      'Necromancy',
      'Transmutation',
    ]),
    description: RichText,
    lore: RichText.optional(),

    // Components
    casting_config: CastingConfigSchema.optional(),
    range_config: RangeConfigSchema.optional(),
    duration_config: DurationConfigSchema.optional(),
    mechanics_config: MechanicsConfigSchema.optional(),

    damage_instances: z.array(DamageInstanceSchema).optional(),
    condition_instances: z.array(ConditionInstanceSchema).optional(),

    tags: RelationMany,
  })
  .strict();

export const ItemSchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    type: z.enum([
      'weapon',
      'armor',
      'consumable',
      'tool',
      'loot',
      'spell_scroll',
      'feature',
      'container',
      'wondrous_item',
      'ring',
      'rod',
      'staff',
      'wand',
      'potion',
    ]),
    rarity: z
      .enum(['common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact', 'varies', 'unknown'])
      .default('common'),

    value: z.number().int().default(0), // CP
    weight: z.number().default(0),
    requires_attunement: z.boolean().default(false),

    description: RichText,
    lore: RichText.optional(),

    equipment_data: EquipmentDataSchema.optional(),

    tags: RelationMany,
    blueprint: RelationMany,
    spriteData: z.array(z.string()).optional(),
  })
  .strict();

export const FeatureSchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    description: RichText,
    level: z.number().int().optional(),
    tags: RelationMany,
  })
  .strict();

export const ClassSchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    hit_die: z.enum(['d6', 'd8', 'd10', 'd12']),
    description: RichText.optional(),
    lore: RichText.optional(),

    proficiencies: RelationMany, // Armor, Weapon, Tool proficiencies

    progression: z
      .array(
        z.object({
          level: z.number().int().min(1).max(20),
          features: RelationMany, // Slugs of features
        })
      )
      .optional(),
  })
  .strict();

export const BlueprintSchema = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    description: RichText.optional(),
    category: z.enum(['Creature', 'Item', 'Structure', 'Effect', 'Terrain']).default('Creature'),
    gridUrl: z.string().optional().describe('Local URI to the master PNG image file used for spatial logic'),
    grid: z.array(z.array(z.string()).min(32)).min(32).optional().describe('Legacy 2D array of string symbols representing the blueprint. Must be at least 32x32.'),
    spriteData: z.array(z.string()).optional().describe('Raw 1D hex array representing the PNG matrix'),
    zones: RelationMany,
    mapping: z.record(z.string(), z.string()).optional().describe('Dictionary mapping symbols in grid to zone slugs (e.g. { "O": "head" })'),
    anchors: z.record(z.string(), z.tuple([z.number(), z.number()])).optional().describe('Explicit [x, y] coordinates for zone attachment points, overriding auto-centroids'),
  })
  .strict();

export type SeedSpell = z.infer<typeof SpellSchema>;
export type SeedItem = z.infer<typeof ItemSchema>;
export type SeedClass = z.infer<typeof ClassSchema>;
export type SeedFeature = z.infer<typeof FeatureSchema>;
export type SeedBlueprint = z.infer<typeof BlueprintSchema>;
