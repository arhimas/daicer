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

async function main() {
  console.log('⚔️  \x1b[1m\x1b[36mStarting Genesis: Item Loader (Batch 3: Armor)...\x1b[0m\n');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    // -------------------------------------------------------------------------
    // 1. Build Lookups (Minimal for Armor)
    // -------------------------------------------------------------------------
    // Armor usually doesn't need DamageTypes or WeaponProps in the same way, but we load them just in case.
    // For pure armor, 'properties' might be used for 'stealth_disadvantage' in the JSON, but in our schema, it's a boolean field in equipment_data.
    // Actually, 'properties' relational field is for weapon properties. We'll leave it empty for armor unless there are special ones (like 'mithral' maybe later).

    // -------------------------------------------------------------------------
    // 2. Load Item Molecules
    // -------------------------------------------------------------------------
    // Targeted glob to avoid re-processing everything heavily, but idempotency handles it.
    // We'll focus on 'adventuring-gear.json'
    const pattern = 'data/library/molecules/items/adventuring-gear.json';
    const files = await glob(pattern, { cwd: backendRoot });

    console.log(`\n📚 Found ${files.length} armor definition files.`);

    for (const file of files) {
      const filePath = path.join(backendRoot, file);
      const filename = path.basename(file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(`   Processing \x1b[33m${filename}\x1b[0m (${data.length} entries)...`);

      let upsertCount = 0;
      let skipCount = 0;

      for (const entry of data) {
        try {
          const existing = await strapi.documents('api::item.item').findFirst({
            filters: { slug: entry.slug },
          });

          if (existing) {
            await strapi.documents('api::item.item').update({
              documentId: existing.documentId,
              data: { ...entry, publishedAt: new Date() },
            });
            process.stdout.write('.');
            skipCount++;
          } else {
            await strapi.documents('api::item.item').create({
              data: { ...entry, publishedAt: new Date() },
            });
            process.stdout.write('+');
            upsertCount++;
          }
        } catch (err) {
          console.error(`\n      ❌ Error ingesting ${entry.slug}:`, err);
        }
      }
      console.log(`\n   ✅ Synced ${upsertCount} new armor pieces, updated ${skipCount} existing from ${filename}.`);
    }

    console.log(`\n✨ \x1b[32mGenesis Armor Load Complete!\x1b[0m\n`);
  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
