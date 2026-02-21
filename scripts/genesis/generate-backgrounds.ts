import { LLMBridge } from '../../src/features/genesis-core/llm-bridge';
import { JsonSchemaBuilder } from '../../src/features/genesis-core/json-schema-builder';
import { SchemaLoader } from '../../src/features/genesis-core/schema-loader';
import fs from 'fs/promises';
import path from 'path';

const BACKGROUNDS = [
    "Acolyte",
    "Charlatan",
    "Criminal",
    "Entertainer",
    "Folk Hero",
    "Guild Artisan",
    "Hermit",
    "Noble",
    "Outlander",
    "Sage",
    "Sailor",
    "Soldier",
    "Urchin"
];

async function entityExists(type: string, name: string): Promise<boolean> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const filename = path.join(process.cwd(), 'seed-data', type, `${slug}.json`);
    try {
        await fs.access(filename);
        return true;
    } catch {
        return false;
    }
}

async function saveEntity(type: string, name: string, data: any) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const dir = path.join(process.cwd(), 'seed-data', type);
    await fs.mkdir(dir, { recursive: true });
    const filename = path.join(dir, `${slug}.json`);
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
}

async function generateBackgrounds() {
    const bridge = new LLMBridge();
    const schemaLoader = new SchemaLoader();
    const schemaBuilder = new JsonSchemaBuilder(schemaLoader);

    console.log('📜 Initializing Background Data Expansion (PHB)');
    
    const jsonSchema = await schemaBuilder.build('api::background.background');

    for (const bgName of BACKGROUNDS) {
        console.log(`\nGenerating Background: ${bgName}`);
        
        if (await entityExists("background", bgName)) { 
            console.log(`⏩ Skipping ${bgName}`); 
            continue; 
        }

        const prompt = `
Generate the official D&D 5e Player's Handbook Background: "${bgName}".
Ensure the output matches the provided JSON Schema strictly.

Instructions:
1. Provide a detailed, flavorful 'description'.
2. List 'skill_proficiencies' (e.g., "Insight, Religion").
3. List 'tool_proficiencies' if any (e.g., "Disguise kit, Forgery kit").
4. List standard 'starting_equipment'.
5. Describe the unique 'feature' of the background (e.g., "Shelter of the Faithful").
6. Ensure 'slug' is kebab-case of the name.
`;

        try {
            const result = await bridge.generateStructured(prompt.trim(), jsonSchema, { model: 'gemini-3-flash' });
            await saveEntity('background', bgName, result);
            console.log(`✅ Success: ${bgName}`);
        } catch (e: any) {
            console.error(`❌ Generation Failed for ${bgName}: ${e.message}`);
        }
    }
    
    console.log('\n🏁 Background Generation Complete.');
}

generateBackgrounds().catch(console.error);
