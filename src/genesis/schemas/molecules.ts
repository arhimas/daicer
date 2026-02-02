
import { z } from 'zod';
import { Slug, RichText, RelationMany } from './common';
import { 
    CastingConfigSchema, 
    RangeConfigSchema, 
    MechanicsConfigSchema, 
    DurationConfigSchema,
    DamageInstanceSchema,
    ConditionInstanceSchema,
    EquipmentDataSchema 
} from './components';

export const SpellSchema = z.object({
    slug: Slug,
    name: z.string().min(1),
    level: z.number().int().min(0).max(9),
    school: z.enum([
        "Abjuration", "Conjuration", "Divination", "Enchantment", 
        "Evocation", "Illusion", "Necromancy", "Transmutation"
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
    
    tags: RelationMany
}).strict();

export const ItemSchema = z.object({
    slug: Slug,
    name: z.string().min(1),
    type: z.enum([
        "weapon", "armor", "consumable", "tool", "loot", "spell_scroll", 
        "feature", "container", "wondrous_item", "ring", "rod", "staff", "wand", "potion"
    ]),
    rarity: z.enum(["common", "uncommon", "rare", "very_rare", "legendary", "artifact"]).default("common"),
    
    value: z.number().int().default(0), // CP
    weight: z.number().default(0),

    description: RichText,
    lore: RichText.optional(),

    equipment_data: EquipmentDataSchema.optional(),
    
    tags: RelationMany
}).strict();

export const FeatureSchema = z.object({
    slug: Slug,
    name: z.string().min(1),
    description: RichText,
    level: z.number().int().optional(),
    tags: RelationMany
}).strict();

export const ClassSchema = z.object({
    slug: Slug,
    name: z.string().min(1),
    hit_die: z.enum(["d6", "d8", "d10", "d12"]),
    description: RichText.optional(),
    lore: RichText.optional(),
    
    proficiencies: RelationMany, // Armor, Weapon, Tool proficiencies
    
    progression: z.array(z.object({
        level: z.number().int().min(1).max(20),
        features: RelationMany // Slugs of features
    })).optional()
}).strict();

export type SeedSpell = z.infer<typeof SpellSchema>;
export type SeedItem = z.infer<typeof ItemSchema>;
export type SeedClass = z.infer<typeof ClassSchema>;
export type SeedFeature = z.infer<typeof FeatureSchema>;
