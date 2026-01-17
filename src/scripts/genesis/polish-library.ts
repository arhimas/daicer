
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import { llmService } from '../../services/llm-service';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// 🛑 SAFETY: DISABLE WORKERS
delete process.env.REDIS_HOST;
delete process.env.ENABLE_QUEUES;

async function main() {
  console.log('✨  \x1b[1m\x1b[35mStarting Genesis: Entity Polisher Agent...\x1b[0m\n');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    const pattern = process.argv[2] || 'data/library/molecules/items/magic-items.json';
    const files = await glob(pattern, { cwd: backendRoot });

    console.log(`\n📚 Found ${files.length} library files to polish.`);
    
    for (const file of files) {
        const filePath = path.join(backendRoot, file);
        const filename = path.basename(file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        console.log(`   Processing \x1b[33m${filename}\x1b[0m (${data.length} entries)...`);

        const polishedData: any[] = [];
        let modifiedCount = 0;

        for (const entry of data) {
            console.log(`   🎨 Polishing: ${entry.name}...`);
            
            // CONTEXT GATHERING
            // TODO: In a real scenario, we would search Vector DB here.
            // For now, we rely on the LLM's internal knowledge + Schema hint.
            
            const prompt = `
Role: You are a Legendary Game Designer and Fantasy Writer (D&D 5e Expert).
Task: Polish the following Game Entity JSON. Make it "State of the Art".

Input Entity:
${JSON.stringify(entry, null, 2)}

Requirements:
1. **Description**: Rewrite the 'description' to be immersive, punchy, and evocative. Use sensory details. MAX 3 sentences.
2. **Lore**: Add a 'lore_snippet' field (string) with a 1-sentence historical or mythical tidbit.
3. **Mechanics**: Ensure 'equipment_data' or 'spell_data' are mechanically sound for 5e.
   - If 'value' seems off, adjust it.
   - If 'rarity' seems off, adjust it.
4. **Formatting**: Return ONLY the VALID JSON object. Do not wrap in markdown code blocks.

Make it feel premium, like a high-end TTRPG supplement.
`;

            try {
                // Call Gemini
                // We assume Gemini returns raw text, we might need to strip markdown block
                let rawResponse = await llmService.generate(prompt);
                
                // Cleanup Markdown code blocks if present
                rawResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                
                const polishedEntry = JSON.parse(rawResponse);
                
                // Merge back preserve ID/Slug integrity if LLM messed it (it shouldn't if prompted well, but safety first)
                if (polishedEntry.slug !== entry.slug) {
                     console.warn(`      ⚠️ LLM changed slug from ${entry.slug} to ${polishedEntry.slug}. Reverting.`);
                     polishedEntry.slug = entry.slug;
                }
                
                polishedData.push(polishedEntry);
                modifiedCount++;
                // process.stdout.write('✨');
                
            } catch (e) {
                console.error(`      ❌ Failed to polish ${entry.name}: ${e.message}`);
                polishedData.push(entry); // Keep original on failure
            }
        }
        
        // Save back to disk
        fs.writeFileSync(filePath, JSON.stringify(polishedData, null, 2));
        console.log(`\n   💾 Overwrote \x1b[36m${filename}\x1b[0m with ${modifiedCount} polished entries.`);
    }

    console.log(`\n✨ \x1b[32mPolishing Complete!\x1b[0m\n`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
