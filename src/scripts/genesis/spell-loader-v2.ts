export {};
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// 🛑 SAFETY: DISABLE WORKERS TO PREVENT RAM EXPLOSION
delete process.env.REDIS_HOST;
delete process.env.ENABLE_QUEUES;

console.log('\n🛡️  \x1b[1m\x1b[33mSafe Mode Enabled: Background Workers Disabled.\x1b[0m');

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------
function parseCastingTime(raw: string) {
    // "1 action", "1 bonus action", "10 minutes"
    const lower = raw.toLowerCase().trim();
    let time_value = 1;
    let time_unit = 'Action';

    const match = lower.match(/^(\d+)\s+(.+)$/);
    if (match) {
        time_value = parseInt(match[1], 10);
        const unit = match[2];
        if (unit.includes('bonus')) time_unit = 'Bonus Action';
        else if (unit.includes('reaction')) time_unit = 'Reaction';
        else if (unit.includes('minute')) time_unit = 'Minute';
        else if (unit.includes('hour')) time_unit = 'Hour';
        else if (unit.includes('day')) time_unit = 'Day';
        else if (unit.includes('round')) time_unit = 'Round';
    } else {
        if (lower.includes('bonus')) time_unit = 'Bonus Action';
        if (lower.includes('reaction')) time_unit = 'Reaction';
    }

    return { time_value, time_unit };
}

function parseComponents(raw: string) {
    // "V, S, M (a tiny ball of...)"
    return {
        verbal: raw.includes('V'),
        somatic: raw.includes('S'),
        material: raw.includes('M'),
        material_description: raw.match(/M\s*\(([^)]+)\)/)?.[1] || null,
        consumed: false, // Parsing "consumed" is hard without specific keyword check, defaulting false
        cost_gp: 0
    };
}

function parseDuration(raw: string, concentration: boolean) {
    // "Instantaneous", "10 minutes", "8 hours"
    const lower = raw.toLowerCase().trim();
    let type = 'Instantaneous';
    let value = null;
    let unit = null;

    if (concentration) type = 'Concentration'; // Schema allows this, or use Time-Limited + concentration flag?
    // Schema enum: ["Instantaneous", "Concentration", "Time-Limited", "Until Dispelled", "Until Triggered", "Special"]
    // "Concentration" usually implies up to X time. But let's check the schema usage.
    // If it says "Concentration, up to 10 minutes", we should probably use "Time-Limited" + concentration=true in typical logic, 
    // BUT the schema has a 'type' enum AND a 'concentration' boolean.
    // Let's set 'type' based on the text.

    if (lower.includes('instantaneous')) {
        type = 'Instantaneous';
    } else if (lower.includes('dispelled')) {
        type = 'Until Dispelled';
    } else if (lower.includes('triggered') || lower.includes('permanent')) {
        type = 'Until Triggered'; // or Special
    } else {
        // likely time limited
        type = 'Time-Limited';
        const match = lower.match(/^(\d+)\s+(.+)$/);
        if (match) {
            value = parseInt(match[1], 10);
            const rawUnit = match[2];
            if (rawUnit.includes('round')) unit = 'Rounds';
            else if (rawUnit.includes('minute')) unit = 'Minutes';
            else if (rawUnit.includes('hour')) unit = 'Hours';
            else if (rawUnit.includes('day')) unit = 'Days';
        }
    }
    
    return { type, value, unit, concentration };
}

async function main() {
  console.log('✨  \x1b[1m\x1b[36mStarting Genesis: Spell Loader V2 (Level 3)...\x1b[0m\n');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    const pattern = 'data/library/molecules/spells/level-4-5.json';
    const files = await glob(pattern, { cwd: backendRoot });

    console.log(`\n📚 Found ${files.length} spell definition files.`);

    for (const file of files) {
        const filePath = path.join(backendRoot, file);
        const filename = path.basename(file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        console.log(`   Processing \x1b[33m${filename}\x1b[0m (${data.length} entries)...`);

        let upsertCount = 0;
        let skipCount = 0;
        
        for (const entry of data) {
            // Parsing
            const castingTime = entry.spell_data ? parseCastingTime(entry.spell_data.casting_time) : { time_value: 1, time_unit: 'Action' };
            const components = entry.spell_data ? parseComponents(entry.spell_data.components) : {};
            const duration = entry.spell_data ? parseDuration(entry.spell_data.duration, entry.spell_data.concentration) : {};

            // Map flat 'spell_data' to Schema Components
            const mappedData: any = {
                slug: entry.slug,
                name: entry.name,
                level: entry.level,
                school: entry.school.charAt(0).toUpperCase() + entry.school.slice(1), 
                description: entry.description,
                publishedAt: new Date(),
                
                casting_config: {
                    ...castingTime,
                    components: components
                },
                range_config: {
                    range_value: null, // Basic parsing, schema actually is Complex. 
                    // Wait, range_config schema?
                    // "range_config": { "component": "game.range-config" }
                    // I haven't checked "game.range-config".
                    // Let's assume standard "range" string field isn't there, it likely has shape, distance, unit.
                    // For now, I'll Skip range_config or map it minimally if I can guess.
                    // Actually, let's just NOT map range_config if I don't recall schema, OR check schema quickly?
                    // I will check schema in next step if this fails, but to be safe, I will inspect `game.range-config` now? NO, I can't.
                    // I'll try to map it to a "note" or just omit specific fields. 
                    // BUT "range_config" component likely has a 'range' string or similar?
                    // Just checked "game.casting-config", "game.spell-components", "game.duration-config".
                    // "game.range-config" is Unknown.
                    // I'll leave range_config EMPTY to avoid crash. I can fill it later manually or via improved script.
                },
                duration_config: duration
            };
            
            // NOTE: casting_config has a 'components' field which IS the 'game.spell-components' component.

            try {
                const existing = await strapi.documents('api::spell.spell').findFirst({
                    filters: { slug: entry.slug }
                });

                if (existing) {
                    await strapi.documents('api::spell.spell').update({
                        documentId: existing.documentId,
                        data: mappedData
                    });
                    process.stdout.write('.');
                    skipCount++;
                } else {
                    await strapi.documents('api::spell.spell').create({
                        data: mappedData
                    });
                    process.stdout.write('+');
                    upsertCount++;
                }
            } catch (err) {
                // console.error(`\n      ❌ Error ingesting ${entry.slug}:`, err);
                console.error(`\n      ❌ Error ingesting ${entry.slug}: ${JSON.stringify((err as any).details?.errors || err)}`);
            }
        }
        console.log(`\n   ✅ Synced ${upsertCount} new spells, updated ${skipCount} existing from ${filename}.`);
    }

    console.log(`\n✨ \x1b[32mGenesis Spell Load Complete!\x1b[0m\n`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
