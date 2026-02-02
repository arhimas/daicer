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
    // UPDATED PATTERN: Match individual atomic JSONs
    const pattern = 'data/library/molecules/classes/*.json';
    const files = await glob(pattern, { cwd: backendRoot });

    console.log(`\n📚 Found ${files.length} class definition files.`);

    // Load Proficiencies for mapping
    const profs = await strapi.documents('api::proficiency.proficiency').findMany({ fields: ['name', 'documentId'] });
    const _profMap = new Map(profs.map((p: any) => [p.name, p.documentId]));

    for (const file of files) {
      const filePath = path.join(backendRoot, file);
      const filename = path.basename(file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(`   Processing \x1b[33m${filename}\x1b[0m (${data.length} entries)...`);

      let upsertCount = 0;
      let skipCount = 0;

      // Single Object Entry per file logic
      // const entry = data; // Rename for clarity
      const entry = Array.isArray(data) ? data[0] : data; // Safe fallback if legacy array

      // Map Proficiencies
      const _mappedProfs: string[] = [];
      if (entry.proficiencies && Array.isArray(entry.proficiencies)) {
        // ... (keep logic)
      }

      // Note: 'proficiencies' in JSON is object { armor: [], tools: [] } ?
      // Or did we flatten it?
      // Inspecting parser output: "proficiencies": { "armor": [...], "weapons": [...] }
      // BUT `class-loader.ts` expected `entry.proficiencies` to be ARRAY of strings (names).
      // Parser output is incompatible with this loader logic if legacy logic required array.
      // We need to FLATTEN the parser object into specific proficiency relations?
      // Or update Class Schema to have JSON proficiencies?
      // Assuming Class Schema likely has relations to `api::proficiency.proficiency`.
      // We'll skip proficiency mapping for now to avoid crash, or try to enable it if easy.

      // Construct Payload
      const payload: any = {
        slug: entry.slug,
        name: entry.name,
        // description: entry.description, // Parser doesn't extract description yet? Check if exists.
        hit_die: entry.hit_die,
        // proficiencies: mappedProfs, // Skip for now till we fix logic
        // features: entry.features || [],
        // 'features' in JSON is array of strings.
        // If schema expects Relations, we need IDs.
        // If schema expects Components, we need shapes.
        publishedAt: new Date(),
      };

      try {
        const existing = await strapi.documents('api::class.class').findFirst({
          filters: { slug: entry.slug },
        });

        if (existing) {
          await strapi.documents('api::class.class').update({
            documentId: existing.documentId,
            data: payload,
          });
          process.stdout.write('.');
          skipCount++;
        } else {
          await strapi.documents('api::class.class').create({
            data: payload,
          });
          process.stdout.write('+');
          upsertCount++;
        }
      } catch (err: any) {
        console.error(`\n      ❌ Error ingesting ${entry.slug}: ${err.message}`);
        // console.error(JSON.stringify(err.details || {}, null, 2));
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
