
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

async function main() {
  console.log('✨  \x1b[1m\x1b[35mStarting Genesis: Race Loader...\x1b[0m\n');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    const pattern = 'data/library/molecules/races/srd-races.json';
    const files = await glob(pattern, { cwd: backendRoot });

    console.log(`\n📚 Found ${files.length} race definition files.`);

    // Load Traits for mapping
    const traits = await strapi.documents('api::trait.trait').findMany({ fields: ['slug', 'documentId'] });
    const traitMap = new Map(traits.map((t: any) => [t.slug, t.documentId]));
        
    for (const file of files) {
        const filePath = path.join(backendRoot, file);
        const filename = path.basename(file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        console.log(`   Processing \x1b[33m${filename}\x1b[0m (${data.length} entries)...`);

        let upsertCount = 0;
        let skipCount = 0;
        
        for (const entry of data) {
            
            // Map Traits
            const mappedTraits: string[] = [];
            if (entry.traits && Array.isArray(entry.traits)) {
                for (const slug of entry.traits) {
                    const traitId = traitMap.get(slug);
                    if (traitId) mappedTraits.push(traitId);
                    else console.warn(`      ⚠️ Unknown Trait: ${slug}`);
                }
            }

            // Construct Payload
            const payload: any = {
                slug: entry.slug,
                name: entry.name,
                description: entry.description,
                speed: entry.speed,
                size: entry.size,
                traits: mappedTraits,
                publishedAt: new Date(),
            };

            try {
                const existing = await strapi.documents('api::race.race').findFirst({
                    filters: { slug: entry.slug }
                });

                if (existing) {
                    await strapi.documents('api::race.race').update({
                        documentId: existing.documentId,
                        data: payload
                    });
                    process.stdout.write('.');
                    skipCount++;
                } else {
                    await strapi.documents('api::race.race').create({
                        data: payload
                    });
                    process.stdout.write('+');
                    upsertCount++;
                }
            } catch (err: any) {
                 console.error(`\n      ❌ Error ingesting ${entry.slug}:`);
                 console.error(`         Message: ${err.message}`);
                 if (err.details) console.error(`         Details: ${JSON.stringify(err.details, null, 2)}`);
                 else console.error(`         Raw: ${JSON.stringify(err)}`);
            }
        }
        console.log(`\n   ✅ Synced ${upsertCount} new races, updated ${skipCount} existing from ${filename}.`);
    }

    console.log(`\n✨ \x1b[32mGenesis Race Load Complete!\x1b[0m\n`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
