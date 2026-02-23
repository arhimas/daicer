/* eslint-disable */
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Utility to normalize enum strings
const normalizeEnum = (val: unknown, validOptions: string[], defaultVal?: string) => {
    if (typeof val !== 'string') return defaultVal;
    const normalized = validOptions.find(opt => opt.toLowerCase() === val.toLowerCase());
    return normalized || defaultVal || val;
};

// Utility to enforce relations are lowercase slugs
const toSlug = (val: any) => {
    if (typeof val === 'string') return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return val;
};

const CasingEnums = {
    item_type: ["weapon", "armor", "consumable", "tool", "loot", "spell_scroll", "feature", "container", "wondrous_item", "ring", "rod", "staff", "wand", "potion"],
    rarity: ["common", "uncommon", "rare", "very_rare", "legendary", "artifact"],
    size: ["Fine", "Diminutive", "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan", "Colossal"],
    school: ["Abjuration", "Conjuration", "Divination", "Enchantment", "Evocation", "Illusion", "Necromancy", "Transmutation"],
    time_unit: ["Action", "Bonus Action", "Reaction", "Minute", "Hour", "Day", "Round"],
    range_type: ["Self", "Touch", "Ranged (Feet)", "Ranged (Miles)", "Sight", "Unlimited"],
    aoe_shape: ["Cone", "Cube", "Cylinder", "Line", "Sphere", "Hemisphere"],
    effect_type: ["Damage", "Healing", "TempHP"],
    damage_type_enum: ["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"],
    timing: ["Instant", "Start of Turn", "End of Turn", "One Time Trigger"],
    duration_type: ["Instantaneous", "Concentration", "Time-Limited", "Until Dispelled", "Until Triggered", "Special"],
    duration_unit: ["Rounds", "Minutes", "Hours", "Days"]
};

// Equipment Data schema. Enforces relation slugs!
const EquipmentDataSchema = z.object({
    damage_dice: z.string().optional().nullable(),
    versatile_dice: z.string().optional().nullable(),
    damage_type: z.preprocess((val: any) => {
        if (Array.isArray(val)) return toSlug(val[0]);
        return toSlug(val);
    }, z.string().optional().nullable()), // RELATION
    range_normal: z.number().optional().nullable(),
    range_long: z.number().optional().nullable(),
    properties: z.preprocess((val: any) => Array.isArray(val) ? val.map(toSlug) : (val ? [toSlug(val)] : val), z.array(z.string()).optional().nullable()), // RELATIONS
    armor_class_base: z.number().optional().nullable(),
    armor_class_dex_bonus: z.boolean().optional().nullable(),
    str_minimum: z.number().optional().nullable(),
    stealth_disadvantage: z.boolean().optional().nullable(),
}).optional().nullable();

// Spell Data schema. Enforces case-sensitive enums!
const SpellDataSchema = z.object({
    level: z.number().min(0).max(9).optional().nullable(),
    school: z.preprocess(val => normalizeEnum(val, CasingEnums.school), z.enum(CasingEnums.school as any).optional().nullable()),
    casting_config: z.object({
        time_value: z.number().default(1),
        time_unit: z.preprocess(val => normalizeEnum(val, CasingEnums.time_unit, "Action"), z.enum(CasingEnums.time_unit as any)),
        reaction_trigger: z.string().optional().nullable(),
        is_ritual: z.boolean().default(false),
        is_concentration: z.boolean().default(false),
        components: z.any().optional()
    }).optional().nullable(),
    range_config: z.object({
        type: z.preprocess(val => normalizeEnum(val, CasingEnums.range_type, "Ranged (Feet)"), z.enum(CasingEnums.range_type as any)),
        distance: z.number().optional().nullable(),
        aoe_shape: z.preprocess(val => normalizeEnum(val, CasingEnums.aoe_shape), z.enum(CasingEnums.aoe_shape as any).optional().nullable()),
    }).optional().nullable(),
    duration_config: z.object({
        type: z.preprocess(val => normalizeEnum(val, CasingEnums.duration_type, "Instantaneous"), z.enum(CasingEnums.duration_type as any)),
        value: z.number().optional().nullable(),
        unit: z.preprocess(val => normalizeEnum(val, CasingEnums.duration_unit), z.enum(CasingEnums.duration_unit as any).optional().nullable()),
        concentration: z.boolean().default(false)
    }).optional().nullable(),
    damage_instances: z.array(z.object({
        effect_type: z.preprocess(val => normalizeEnum(val, CasingEnums.effect_type, "Damage"), z.enum(CasingEnums.effect_type as any)),
        damage_type: z.preprocess(val => normalizeEnum(val, CasingEnums.damage_type_enum), z.enum(CasingEnums.damage_type_enum as any).optional().nullable()),
        dice_count: z.number().default(1),
        dice_value: z.number().default(6),
        flat_bonus: z.number().default(0),
        timing: z.preprocess(val => normalizeEnum(val, CasingEnums.timing, "Instant"), z.enum(CasingEnums.timing as any))
    })).optional().nullable()
}).optional().nullable();

const ItemSchema = z.object({
    slug: z.string(),
    name: z.string(),
    description: z.string().optional(),
    lore: z.string().optional(),
    type: z.preprocess(val => normalizeEnum(val, CasingEnums.item_type, 'loot'), z.enum(CasingEnums.item_type as any)),
    rarity: z.preprocess(val => normalizeEnum(val, CasingEnums.rarity, 'common'), z.enum(CasingEnums.rarity as any)),
    value: z.number().default(0),
    weight: z.number().default(0),
    size: z.preprocess(val => normalizeEnum(val, CasingEnums.size, 'Medium'), z.enum(CasingEnums.size as any)),
    equipment_data: EquipmentDataSchema,
    spell_data: SpellDataSchema,
    tags: z.array(z.string()).optional()
}).passthrough();

async function transformItems() {
    console.log('🔄 Starting Item Normalization (Blueprints -> Strapi Items)');
    const itemsDir = path.join(process.cwd(), 'seed-data', 'item');

    let files: string[] = [];
    try {
        files = await fs.readdir(itemsDir);
    } catch {
        console.log('No items found to transform.');
        return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(itemsDir, file);
        const rawData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

        // Handle stringified numbers
        if (typeof rawData.value === 'string') rawData.value = parseInt(rawData.value) || 0;
        if (typeof rawData.weight === 'string') rawData.weight = parseFloat(rawData.weight) || 0;

        const validation = ItemSchema.safeParse(rawData);
        
        if (validation.success) {
            const cleaned = JSON.parse(JSON.stringify(validation.data));
            await fs.writeFile(filePath, JSON.stringify(cleaned, null, 2));
            successCount++;
        } else {
            console.error(`❌ Validation Failed for ${rawData.name}:`, validation.error.format());
            // Log deep errors
            Object.entries(validation.error.format()).forEach(([key, val]: [string, any]) => {
                if (val && typeof val === 'object' && '_errors' in val && val._errors.length > 0) {
                     console.error(`  - ${key}: ${val._errors.join(', ')}`);
                }
            });
            failCount++;
        }
    }

    console.log(`\n🏁 Normalized ${successCount} items. Failed: ${failCount}.`);
}

transformItems().catch(console.error);
