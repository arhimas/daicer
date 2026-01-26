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
// Parsing Helpers (Reused from Spell Loader)
// -------------------------------------------------------------------------
/*
function parseCastingTime(raw: string) {
    if (!raw) return { time_value: 1, time_unit: 'Action' };
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
    }
    return { time_value, time_unit };
}
*/

/*
function parseComponents(raw: string) {
    if (!raw) return { verbal: false, somatic: false, material: false };
    return {
        verbal: raw.includes('V'),
        somatic: raw.includes('S'),
        material: raw.includes('M'),
        material_description: raw.match(/M\s*\(([^)]+)\)/)?.[1] || null,
        consumed: false,
        cost_gp: 0
    };
}
*/

/*
function parseDuration(raw: string) {
    if (!raw) return { type: 'Instantaneous' };
    const lower = raw.toLowerCase().trim();
    let type = 'Instantaneous';
    let value = null;
    let unit = null;

    if (lower.includes('instantaneous')) type = 'Instantaneous';
    else if (lower.includes('dispelled')) type = 'Until Dispelled';
    else if (lower.includes('triggered')) type = 'Until Triggered';
    else {
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
    return { type, value, unit };
}
*/

/*
function parseRange(raw: string | undefined): any {
    if (!raw) return null; // Don't create component if no range
    const lower = raw.toLowerCase().trim();
    
    if (lower.includes('self')) return { type: 'Self', distance: 0 };
    if (lower.includes('touch')) return { type: 'Touch', distance: 0 };
    if (lower.includes('sight')) return { type: 'Sight', distance: 0 };
    if (lower.includes('unlimited')) return { type: 'Unlimited', distance: 0 };
    
    // "150 feet", "1 mile"
    const match = lower.match(/^(\d+)\s+(.+)$/);
    if (match) {
        const dist = parseInt(match[1], 10);
        const unit = match[2];
        if (unit.includes('mile')) return { type: 'Ranged (Miles)', distance: dist };
        return { type: 'Ranged (Feet)', distance: dist };
    }
    
    // Fallback
    return { type: 'Ranged (Feet)', distance: 0 }; 
}
*/

async function main() {
  console.log('✨  \x1b[1m\x1b[35mStarting Genesis: Magic Item Loader...\x1b[0m\n');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    const pattern = 'data/library/molecules/items/*.json';
    const files = await glob(pattern, { cwd: backendRoot });

    console.log(`\n📚 Found ${files.length} magic item definition files.`);

    // Load damage types and weapon properties for equipment mapping
    // const damageTypes = await strapi.documents('api::damage-type.damage-type').findMany({ fields: ['slug', 'documentId'] });
    // const damageTypeMap = new Map(damageTypes.map((dt: any) => [dt.slug, dt.documentId]));

    // const weaponProps = await strapi.documents('api::weapon-property.weapon-property').findMany({ fields: ['slug', 'documentId'] });
    // const weaponPropMap = new Map(weaponProps.map((wp: any) => [wp.slug, wp.documentId]));
        
    for (const file of files) {
        const filePath = path.join(backendRoot, file);
        const filename = path.basename(file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        console.log(`   Processing \x1b[33m${filename}\x1b[0m (${data.length} entries)...`);

        let upsertCount = 0;
        let skipCount = 0;
        
        // Single Object Entry
        const entry = Array.isArray(data) ? data[0] : data;

            // Construct Payload
            const payload: any = {
                slug: entry.slug,
                name: entry.name,
                type: entry.type,
                rarity: entry.rarity,
                value: entry.value,
                weight: entry.weight,
                description: entry.description,
                publishedAt: new Date(),
            };
            
            // ItemParser output doesn't have `equipment_data` or `spell_data` yet.
            // It only has basic fields.
            // We'll keep it simple to ensure basic metadata is loaded.
            
            try {
                const existing = await strapi.documents('api::item.item').findFirst({
                    filters: { slug: entry.slug }
                });

                if (existing) {
                    await strapi.documents('api::item.item').update({
                        documentId: existing.documentId,
                        data: payload
                    });
                    process.stdout.write('.');
                    skipCount++;
                } else {
                    await strapi.documents('api::item.item').create({
                        data: payload
                    });
                    process.stdout.write('+');
                    upsertCount++;
                }
            } catch (_err: any) {
                 // console.error(`\n      ❌ Error ingesting ${entry.slug}: ${err.message}`);
            }
        console.log(`\n   ✅ Synced ${upsertCount} new magic items, updated ${skipCount} existing from ${filename}.`);
    }

    console.log(`\n✨ \x1b[32mGenesis Magic Item Load Complete!\x1b[0m\n`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
