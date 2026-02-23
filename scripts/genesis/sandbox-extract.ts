/* eslint-disable */
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { LLMBridge } from '../../src/features/genesis-core/llm-bridge';
import zodToJsonSchema from 'zod-to-json-schema';

console.log('🔄 Extractor Sandbox starting...');

const CasingEnums = {
    action_type: ["melee", "ranged", "spell", "utility", "ability"],
    range_type: ["Self", "Touch", "Ranged (Feet)", "Ranged (Miles)", "Sight", "Unlimited"],
    effect_type: ["Damage", "Healing", "TempHP"],
    timing: ["Instant", "Start of Turn", "End of Turn", "One Time Trigger"]
};

// Extremely simplified schema to see if Gemini stops panicking
const SimpleActionSchema = z.object({
    actions: z.array(z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(CasingEnums.action_type as any).default("melee"),
        toHit: z.number().optional().nullable(),
        damage_instances: z.array(z.object({
            effect_type: z.enum(CasingEnums.effect_type as any).default("Damage"),
            dice_count: z.number().default(0),
            dice_value: z.number().default(0),
            timing: z.enum(CasingEnums.timing as any).default("Instant")
        })).optional().nullable()
    }))
});

async function run() {
    const bridge = new LLMBridge({ temperature: 0.1 });
    
    // Test on one file
    const filePath = path.join(process.cwd(), 'seed-data', 'monster', 'aboleth.json');
    const rawData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    
    console.log(`Analyzing: ${rawData.name}`);
    const textBlocks = [];
    if (rawData.special_abilities) textBlocks.push(`**Special Abilities:**\n${rawData.special_abilities}`);
    if (rawData.actions) textBlocks.push(`**Actions:**\n${rawData.actions}`);
    if (rawData.legendary_actions) textBlocks.push(`**Legendary Actions:**\n${rawData.legendary_actions}`);
    const fullText = textBlocks.join('\n\n');

    const prompt = `Extract distinct actions from:\n${fullText}`;

    try {
        console.log('⏳ Hitting Gemini (using raw JSON Schema to avoid Langchain strict bugs)...');
        
        // Let's use standard generateStructured which wraps withStructuredOutput
        const result = await bridge.generateStructured(prompt, SimpleActionSchema, { model: 'gemini-3-flash' });
        
        console.log('✅ Success:', JSON.stringify(result, null, 2));

    } catch (e: any) {
        console.error('❌ Fail:', e);
    }
}

run().catch(console.error);
