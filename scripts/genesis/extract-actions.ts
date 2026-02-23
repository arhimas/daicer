/* eslint-disable */
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { LLMBridge } from '../../src/features/genesis-core/llm-bridge';

// Reuse strict standard Casing Enums
const CasingEnums = {
    action_type: ["melee", "ranged", "spell", "utility", "ability"],
    range_type: ["Self", "Touch", "Ranged (Feet)", "Ranged (Miles)", "Sight", "Unlimited"],
    aoe_shape: ["Cone", "Cube", "Cylinder", "Line", "Sphere", "Hemisphere"],
    mechanics_action: ["Melee Spell Attack", "Ranged Spell Attack", "Strength Save", "Dexterity Save", "Constitution Save", "Intelligence Save", "Wisdom Save", "Charisma Save", "Auto-Hit", "None"],
    save_effect: ["Negate", "Half", "None"],
    effect_type: ["Damage", "Healing", "TempHP"],
    damage_type: ["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"],
    timing: ["Instant", "Start of Turn", "End of Turn", "One Time Trigger"],
    condition: ["Blinded", "Charmed", "Deafened", "Exhaustion", "Frightened", "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious", "Special"],
    save_attribute: ["STR", "DEX", "CON", "INT", "WIS", "CHA"]
};

// Define structure we want Gemini to output
const ActionExtractionSchema = z.object({
    actions: z.array(z.object({
        name: z.string().describe("The name of the action, ability, or trait (e.g., 'Bite', 'Multiattack', 'Amphibious')"),
        description: z.string().describe("The full exact text description of what this action does."),
        type: z.enum(CasingEnums.action_type as any).default("melee"),
        toHit: z.number().optional().nullable().describe("The attack bonus to hit (e.g., +5 -> 5). Null if not an attack."),
        range_config: z.object({
            type: z.enum(CasingEnums.range_type as any).default("Touch"),
            distance: z.number().optional().nullable(),
            aoe_shape: z.enum(CasingEnums.aoe_shape as any).optional().nullable(),
            aoe_size: z.number().optional().nullable()
        }).optional().nullable(),
        mechanics_config: z.object({
            action_type: z.enum(CasingEnums.mechanics_action as any).default("None"),
            save_effect: z.enum(CasingEnums.save_effect as any).optional().nullable()
        }).optional().nullable(),
        save: z.object({
            dc: z.number().describe("The DC of the saving throw (e.g., DC 14 -> 14)"),
            attribute: z.enum(CasingEnums.save_attribute as any)
        }).optional().nullable(),
        damage_instances: z.array(z.object({
            effect_type: z.enum(CasingEnums.effect_type as any).default("Damage"),
            damage_type: z.enum(CasingEnums.damage_type as any).optional().nullable(),
            dice_count: z.number().default(0),
            dice_value: z.number().default(0),
            flat_bonus: z.number().default(0),
            timing: z.enum(CasingEnums.timing as any).default("Instant")
        })).optional().nullable(),
        condition_instances: z.array(z.object({
            condition: z.enum(CasingEnums.condition as any),
            description: z.string().optional().nullable(),
            chance: z.number().default(100),
            duration_rounds: z.number().optional().nullable()
        })).optional().nullable()
    }))
});

async function extractActions() {
    console.log('🔄 Starting Deep Action Extraction via Raw JSON Parsing');
    const monstersDir = path.join(process.cwd(), 'seed-data', 'monster');
    const actionsDir = path.join(process.cwd(), 'seed-data', 'action');
    await fs.mkdir(actionsDir, { recursive: true });

    let files: string[] = [];
    try {
        files = await fs.readdir(monstersDir);
    } catch {
        console.log('No monsters found to process.');
        return;
    }

    const bridge = new LLMBridge({ temperature: 0.1 }); // Low temp for extraction

    let successCount = 0;
    let failCount = 0;

    // Process Sequentially 
    const BATCH_SIZE = 1;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        for (const file of batch) {
            if (!file.endsWith('.json')) continue;
            const filePath = path.join(monstersDir, file);
            const rawData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
            const monster = rawData.monster || rawData;

            const textBlocks = [];
            if (monster.special_abilities) textBlocks.push(`**Special Abilities:**\n${monster.special_abilities}`);
            if (monster.actions) textBlocks.push(`**Actions:**\n${monster.actions}`);
            if (monster.legendary_actions) textBlocks.push(`**Legendary Actions:**\n${monster.legendary_actions}`);
            
            const fullText = textBlocks.join('\n\n');
            if (!fullText.trim()) continue;

            const monsterSlug = file.replace('.json', '');

            // Provide schema and text to LLM
            const prompt = `You are parsing D&D 5e monster stat blocks.
Extract ALL distinct actions, attacks, special abilities, and legendary actions from the text below.
YOU MUST RESPOND ONLY WITH A VALID JSON OBJECT matching this exact structure:
{
  "actions": [
    {
       "name": "Bite",
       "description": "Melee Weapon Attack...",
       "type": "melee",
       "toHit": 5,
       "range_config": { "type": "Touch" },
       "mechanics_config": { "action_type": "Melee Spell Attack" },
       "save": { "dc": 14, "attribute": "CON" },
       "damage_instances": [{ "effect_type": "Damage", "damage_type": "Piercing", "dice_count": 2, "dice_value": 6, "flat_bonus": 3, "timing": "Instant" }],
       "condition_instances": [{ "condition": "Poisoned", "chance": 100, "duration_rounds": 10 }]
    }
  ]
}

Only use these exact enums (Case Sensitive!):
- type: ${CasingEnums.action_type.join(', ')}
- range_config.type: ${CasingEnums.range_type.join(', ')}
- mechanics_config.action_type: ${CasingEnums.mechanics_action.join(', ')}
- damage_instances.damage_type: ${CasingEnums.damage_type.join(', ')}
- condition_instances.condition: ${CasingEnums.condition.join(', ')}
- save.attribute: STR, DEX, CON, INT, WIS, CHA

Monster Name: ${monster.name}
Text to Parse:
${fullText}
            `;

            try {
                // Bypass withStructuredOutput bug by using raw text generation and manual parsing
                let rawRes = await bridge.generateText(prompt.trim(), { model: 'gemini-3-flash' });
                
                // Extract JSON from markdown
                rawRes = rawRes.replace(/```json/gi, '').replace(/```/g, '').trim();
                
                let result = JSON.parse(rawRes);
                
                // Validate it
                result = ActionExtractionSchema.parse(result);
                
                // Save each action to disk
                for (const action of result.actions) {
                    const actionSlug = `${monsterSlug}-${action.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
                    
                    const payload = {
                        ...action,
                        slug: actionSlug
                    };

                    await fs.writeFile(path.join(actionsDir, `${actionSlug}.json`), JSON.stringify(payload, null, 2));
                    successCount++;
                }
                console.log(`✅ Extracted actions for ${monster.name} (${result.actions.length} actions)`);
            } catch (e: any) {
                console.error(`❌ Failed to extract actions for ${monster.name}: ${e.message}`);
                failCount++;
            }
        }
    }

    console.log(`\n🏁 Extracted ${successCount} total actions. Encounters failed: ${failCount}.`);
}

extractActions().catch(console.error);
