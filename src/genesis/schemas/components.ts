
import { z } from 'zod';
import { SizeEnum, AbilityScoreEnum, RelationMany } from './common';

// --- Atomic Configs ---

export const CastingConfigSchema = z.object({
    time_value: z.number().int().min(1).default(1),
    time_unit: z.enum(["Action", "Bonus Action", "Reaction", "Minute", "Hour", "Day", "Round", "Year"]).default("Action"),
    reaction_trigger: z.string().optional(),
    is_ritual: z.boolean().default(false),
    is_concentration: z.boolean().default(false),
    components: z.object({ // game.spell-components
        verbal: z.boolean().default(false),
        somatic: z.boolean().default(false),
        material: z.boolean().default(false),
        materials_description: z.string().optional()
    }).optional()
}).strict();

export const RangeConfigSchema = z.object({
    type: z.enum(["Self", "Touch", "Ranged (Feet)", "Ranged (Miles)", "Sight", "Unlimited"]).default("Ranged (Feet)"),
    distance: z.number().int().optional(),
    aoe_shape: z.enum(["Cone", "Cube", "Cylinder", "Line", "Sphere", "Hemisphere"]).optional(),
    aoe_size: z.number().int().optional(),
    aoe_height: z.number().int().optional() // For Cylinder
}).strict();

export const MechanicsConfigSchema = z.object({
    action_type: z.enum([
        "Melee Spell Attack", "Ranged Spell Attack", "Melee Weapon Attack", "Ranged Weapon Attack",
        "Strength Save", "Dexterity Save", "Constitution Save", "Intelligence Save", "Wisdom Save", "Charisma Save",
        "Auto-Hit", "None"
    ]).default("None"),
    save_effect: z.enum(["Negate", "Half", "None"]).optional()
}).strict();

export const DurationConfigSchema = z.object({
    type: z.enum(["Instantaneous", "Round", "Minute", "Hour", "Day", "Until Dispelled", "Special"]).default("Instantaneous"),
    amount: z.number().int().optional(),
    up_to: z.boolean().default(false) // e.g., "Up to 1 hour"
}).strict();

// --- Instance Data ---

export const DamageInstanceSchema = z.object({
    amount_dice: z.string().optional(), // e.g. "8d6"
    amount_flat: z.number().int().optional(),
    type: z.string().optional(), // Slug of damage-type
    scaling: z.string().optional() // Description of scaling
}).strict();

export const ConditionInstanceSchema = z.object({
    condition: z.string(), // Slug of status-effect
    duration_unit: z.enum(["Round", "Minute", "Hour", "Day"]).optional(),
    duration_value: z.number().int().optional()
}).strict();

// --- Stats & Equipment ---

export const StatsSchema = z.object({
    strength: z.number().int().default(10),
    dexterity: z.number().int().default(10),
    constitution: z.number().int().default(10),
    intelligence: z.number().int().default(10),
    wisdom: z.number().int().default(10),
    charisma: z.number().int().default(10),
    
    walkSpeed: z.number().int().default(0),
    flySpeed: z.number().int().default(0),
    swimSpeed: z.number().int().default(0),
    climbSpeed: z.number().int().default(0),
    burrowSpeed: z.number().int().default(0),
    hover: z.boolean().default(false),

    saves: z.array(AbilityScoreEnum).optional(),
    skills: z.array(z.string()).optional(), // Array of skill slugs e.g. 'perception'
    
    passivePerception: z.number().int().optional(),
    darkvision: z.number().int().optional(),
    blindsight: z.number().int().optional(),
    truesight: z.number().int().optional(),
    tremorsense: z.number().int().optional(),
    
    languages: RelationMany // Slugs
}).strict();

export const EquipmentDataSchema = z.object({
    damage_dice: z.string().optional(), // "1d8"
    damage_type: z.string().optional(), // Slug
    range_normal: z.number().int().optional(),
    range_long: z.number().int().optional(),
    properties: RelationMany, // Slugs of weapon-property
    armor_class_base: z.number().int().optional(),
    armor_class_dex_bonus: z.boolean().default(false),
    str_minimum: z.number().int().optional(),
    stealth_disadvantage: z.boolean().default(false),
}).strict();
