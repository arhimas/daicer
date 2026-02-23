/* eslint-disable */
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Utility to normalize enum strings (e.g., "fire" -> "Fire", "dexterity save" -> "Dexterity Save")
const normalizeEnum = (val: unknown, validOptions: string[], defaultVal?: string) => {
    if (typeof val !== 'string') return defaultVal;
    const normalized = validOptions.find(opt => opt.toLowerCase() === val.toLowerCase());
    return normalized || defaultVal || val;
};

// Deep Strapi Component Schemas
const CasingEnums = {
    school: ["Abjuration", "Conjuration", "Divination", "Enchantment", "Evocation", "Illusion", "Necromancy", "Transmutation"],
    time_unit: ["Action", "Bonus Action", "Reaction", "Minute", "Hour", "Day", "Round"],
    range_type: ["Self", "Touch", "Ranged (Feet)", "Ranged (Miles)", "Sight", "Unlimited"],
    aoe_shape: ["Cone", "Cube", "Cylinder", "Line", "Sphere", "Hemisphere"],
    action_type: ["Melee Spell Attack", "Ranged Spell Attack", "Strength Save", "Dexterity Save", "Constitution Save", "Intelligence Save", "Wisdom Save", "Charisma Save", "Auto-Hit", "None"],
    save_effect: ["Negate", "Half", "None"],
    effect_type: ["Damage", "Healing", "TempHP"],
    damage_type: ["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"],
    timing: ["Instant", "Start of Turn", "End of Turn", "One Time Trigger"],
    duration_type: ["Instantaneous", "Concentration", "Time-Limited", "Until Dispelled", "Until Triggered", "Special"],
    duration_unit: ["Rounds", "Minutes", "Hours", "Days"],
    condition: ["Blinded", "Charmed", "Deafened", "Exhaustion", "Frightened", "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious", "Special"],
    scaling_type: ["Dice", "Target", "Duration"],
    scaling_method: ["Per Slot Level", "Every 2 Slot Levels", "Specific Thresholds"]
};

// Deep sub-component schemas
const ConditionInstanceSchema = z.object({
  condition: z.preprocess(val => normalizeEnum(val, CasingEnums.condition, "Special"), z.enum(CasingEnums.condition as any)),
  description: z.string().optional().nullable(),
  chance: z.number().default(100),
  duration_rounds: z.number().optional().nullable()
});

const ScalingConfigSchema = z.object({
  scales: z.boolean().default(false),
  type: z.preprocess(val => normalizeEnum(val, CasingEnums.scaling_type, "Dice"), z.enum(CasingEnums.scaling_type as any)),
  method: z.preprocess(val => normalizeEnum(val, CasingEnums.scaling_method, "Per Slot Level"), z.enum(CasingEnums.scaling_method as any)),
  dice_count: z.number().optional().nullable(),
  dice_value: z.number().optional().nullable()
});

const SpellSchema = z.object({
  slug: z.string(),
  name: z.string(),
  level: z.number().min(0).max(9),
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
      aoe_size: z.number().optional().nullable(),
      aoe_height: z.number().optional().nullable()
  }).optional().nullable(),
  duration_config: z.object({
      type: z.preprocess(val => normalizeEnum(val, CasingEnums.duration_type, "Instantaneous"), z.enum(CasingEnums.duration_type as any)),
      value: z.number().optional().nullable(),
      unit: z.preprocess(val => normalizeEnum(val, CasingEnums.duration_unit), z.enum(CasingEnums.duration_unit as any).optional().nullable()),
      concentration: z.boolean().default(false)
  }).optional().nullable(),
  mechanics_config: z.object({
      action_type: z.preprocess(val => normalizeEnum(val, CasingEnums.action_type, "None"), z.enum(CasingEnums.action_type as any)),
      save_effect: z.preprocess(val => normalizeEnum(val, CasingEnums.save_effect), z.enum(CasingEnums.save_effect as any).optional().nullable())
  }).optional().nullable(),
  damage_instances: z.array(z.object({
      effect_type: z.preprocess(val => normalizeEnum(val, CasingEnums.effect_type, "Damage"), z.enum(CasingEnums.effect_type as any)),
      damage_type: z.preprocess(val => normalizeEnum(val, CasingEnums.damage_type), z.enum(CasingEnums.damage_type as any).optional().nullable()),
      dice_count: z.number().default(1),
      dice_value: z.number().default(6),
      flat_bonus: z.number().default(0),
      timing: z.preprocess(val => normalizeEnum(val, CasingEnums.timing, "Instant"), z.enum(CasingEnums.timing as any))
  })).optional().nullable(),
  condition_instances: z.array(ConditionInstanceSchema).optional().nullable(),
  scaling_config: ScalingConfigSchema.optional().nullable(),
  description: z.string().optional().nullable(),
  lore: z.string().optional().nullable()
}).passthrough();

async function transformSpells() {
    console.log('🔄 Starting Spell Normalization (Blueprints -> Strapi Spells)');
    const spellsDir = path.join(process.cwd(), 'seed-data', 'spell');

    let files: string[] = [];
    try {
        files = await fs.readdir(spellsDir);
    } catch {
        console.log('No spells found to transform.');
        return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(spellsDir, file);
        const rawData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

        const validation = SpellSchema.safeParse(rawData);
        
        if (validation.success) {
            // Drop undefined/null to keep JSON clean but strict
            const cleaned = JSON.parse(JSON.stringify(validation.data));
            await fs.writeFile(filePath, JSON.stringify(cleaned, null, 2));
            successCount++;
        } else {
            console.error(`❌ Validation Failed for ${rawData.name}:`, validation.error.format());
            failCount++;
        }
    }

    console.log(`\n🏁 Normalized ${successCount} spells. Failed: ${failCount}.`);
}

transformSpells().catch(console.error);
