 

import { z } from 'zod';
import { APIReferenceSchema, DCMethodSchema, } from './common-schemas';

export const MonsterSchema = z.object({
    index: z.string(),
    name: z.string(),
    size: z.string(),
    type: z.string(),
    subtype: z.string().nullable().optional(),
    alignment: z.string(),
    armor_class: z.array(z.object({
        type: z.string(),
        value: z.number(),
        desc: z.string().optional(),
        armor: z.array(APIReferenceSchema).optional()
    })).or(z.number()).or(z.object({ value: z.number() })), // Handling variability
    hit_points: z.number(),
    hit_dice: z.string(),
    hit_points_roll: z.string().optional(),
    speed: z.object({
        walk: z.string().optional(),
        fly: z.string().optional(),
        swim: z.string().optional(),
        climb: z.string().optional(),
        burrow: z.string().optional(),
        hover: z.boolean().optional()
    }),
    strength: z.number(),
    dexterity: z.number(),
    constitution: z.number(),
    intelligence: z.number(),
    wisdom: z.number(),
    charisma: z.number(),
    proficiencies: z.array(z.object({
        value: z.number(),
        proficiency: APIReferenceSchema
    })),
    damage_vulnerabilities: z.array(z.string()),
    damage_resistances: z.array(z.string()),
    damage_immunities: z.array(z.string()),
    condition_immunities: z.array(APIReferenceSchema),
    senses: z.record(z.string(), z.string().or(z.number())),
    languages: z.string(),
    challenge_rating: z.number(),
    xp: z.number(),
    special_abilities: z.array(z.object({
        name: z.string(),
        desc: z.string(),
        usage: z.any().optional(),
        dc: DCMethodSchema.optional()
    })).optional(),
    actions: z.array(z.object({
        name: z.string(),
        desc: z.string(),
        attack_bonus: z.number().optional(),
        damage: z.array(z.object({
            damage_type: APIReferenceSchema.optional(),
            damage_dice: z.string().optional()
        })).optional(),
        dc: DCMethodSchema.optional(),
        usage: z.any().optional()
    })).optional(),
    legendary_actions: z.array(z.object({
        name: z.string(),
        desc: z.string(),
        attack_bonus: z.number().optional()
    })).optional(),
    reactions: z.array(z.object({
        name: z.string(),
        desc: z.string(),
        dc: DCMethodSchema.optional()
    })).optional(),
    url: z.string()
});

export type SourceMonster = z.infer<typeof MonsterSchema>;
