
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
  console.log('✨  \x1b[1m\x1b[35mStarting Genesis: Class Loader...\x1b[0m\n');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    const pattern = 'data/library/molecules/classes/srd-classes.json';
    const files = await glob(pattern, { cwd: backendRoot });

    console.log(`\n📚 Found ${files.length} class definition files.`);

    // Load Proficiencies for mapping
    const profs = await strapi.documents('api::proficiency.proficiency').findMany({ fields: ['name', 'documentId'] });
    const profMap = new Map(profs.map((p: any) => [p.name, p.documentId]));
        
    for (const file of files) {
        const filePath = path.join(backendRoot, file);
        const filename = path.basename(file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        console.log(`   Processing \x1b[33m${filename}\x1b[0m (${data.length} entries)...`);

        let upsertCount = 0;
        let skipCount = 0;
        
        for (const entry of data) {
            
            // Map Proficiencies
            const mappedProfs: string[] = [];
            if (entry.proficiencies && Array.isArray(entry.proficiencies)) {
                for (const name of entry.proficiencies) {
                    const profId = profMap.get(name);
                    if (profId) mappedProfs.push(profId);
                    else console.warn(`      ⚠️ Unknown Proficiency: ${name}`);
                }
            }

            // Construct Payload
            const payload: any = {
                slug: entry.slug,
                name: entry.name,
                description: entry.description,
                hit_die: entry.hit_die,
                proficiencies: mappedProfs,
                features: entry.features || [], // Component
                publishedAt: new Date(),
            };

            try {
                const existing = await strapi.documents('api::class.class').findFirst({
                    filters: { slug: entry.slug }
                });

                if (existing) {
                    await strapi.documents('api::class.class').update({
                        documentId: existing.documentId,
                        data: payload
                    });
                    process.stdout.write('.');
                    skipCount++;
                } else {
                    await strapi.documents('api::class.class').create({
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
        console.log(`\n   ✅ Synced ${upsertCount} new classes, updated ${skipCount} existing from ${filename}.`);
    }

    console.log(`\n✨ \x1b[32mGenesis Class Load Complete!\x1b[0m\n`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
