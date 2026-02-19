import { createGenesisEngine } from './factory';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    try {
        const args = process.argv.slice(2);
        if (args.length < 2) {
            console.error('Usage: ts-node scripts/genesis/generate-entity.ts <uid> --prompt "<instruction>"');
            process.exit(1);
        }

        const uid = args[0];
        const promptIndex = args.indexOf('--prompt');
        
        if (promptIndex === -1 || !args[promptIndex + 1]) {
             console.error('Missing --prompt argument');
             process.exit(1);
        }

        const userPrompt = args[promptIndex + 1];
        
        console.log(`🚀 Genesis Engine Validating Protocol...`);
        console.log(`Target: ${uid}`);

        const { loader, prompts, bridge, dryRun } = createGenesisEngine();

        // 1. Build Prompt & Schema
        console.log(`\n[1/4] Constructing Schema & Prompts...`);
        try {
            const { systemPrompt, jsonSchema } = await prompts.buildPrompt(uid);
            
            // 2. Generate
            console.log(`\n[2/4] Contacting Gemini 3 Flash...`);
            const result = await bridge.generateStructured(
                userPrompt, 
                jsonSchema, 
                { systemInstruction: systemPrompt, temperature: 0.7 }
            );

            console.log(`\n[3/4] Validating Logic (Dry Run)...`);
            const validation = await dryRun.validate(result, uid);

            if (validation.valid) {
                console.log(`\n✅ SUCCESS! Entity Generated & Validated.`);
                console.log(JSON.stringify(result, null, 2));
            } else {
                 console.error(`\n❌ Validation Failed:`);
                 validation.errors.forEach(e => console.error(`- ${e}`));
                 console.log(`\nGenerated Output (Invalid):`);
                 console.log(JSON.stringify(result, null, 2));
                 process.exit(1);
            }
        } catch (innerError: any) {
            console.error("Inner Error:", innerError);
            if (innerError.stack) console.error(innerError.stack);
            process.exit(1);
        }

    } catch (error: any) {
        console.error(`\n💥 Fatal Error:`, error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

main();
