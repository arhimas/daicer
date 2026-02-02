export {};
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { globSync } from 'glob';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  console.log('\n🧪 \x1b[1m\x1b[36mStarting Genesis: Molecules Loader (L1)...\x1b[0m\n');

  // HACK: Fix CWD for Strapi auto-loader
  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  // Initialize Strapi
  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    const moleculesDir = path.join(backendRoot, 'data/library/molecules');

    // --- LOOKUPS ---
    console.log('\n🔎 Building Atom Lookups...');
    const damageTypes = await strapi.documents('api::damage-type.damage-type').findMany();
    const damageTypeMap = new Map(damageTypes.map((dt: any) => [dt.slug, dt.documentId]));
    console.log(`   Mapped ${damageTypeMap.size} Damage Types.`);

    const weaponProps = await strapi.documents('api::weapon-property.weapon-property').findMany();
    const weaponPropMap = new Map(weaponProps.map((wp: any) => [wp.slug, wp.documentId]));
    console.log(`   Mapped ${weaponPropMap.size} Weapon Properties.`);

    // --- SPELLS ---
    const spellFiles = globSync(`${moleculesDir}/spells/*.json`);
    console.log(`\n📚 Found ${spellFiles.length} spell definition files.`);

    for (const file of spellFiles) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      console.log(`   Processing ${path.basename(file)} (${data.length} entries)...`);

      // ... (Spell logic remains same) ...
      let upsertCount = 0;
      for (const spell of data) {
        const existing = await strapi.documents('api::spell.spell').findFirst({
          filters: { slug: spell.slug },
        });
        const spellData = { ...spell, publishedAt: new Date() };

        if (existing) {
          await strapi.documents('api::spell.spell').update({
            documentId: existing.documentId,
            data: spellData,
          });
          process.stdout.write('.');
        } else {
          await strapi.documents('api::spell.spell').create({
            data: spellData,
          });
          process.stdout.write('+');
        }
        upsertCount++;
      }
      console.log(`\n   ✅ Synced ${upsertCount} spells from ${path.basename(file)}.`);
    }

    // --- ITEMS ---
    const itemFiles = globSync(`${moleculesDir}/items/*.json`);
    console.log(`\n🛡️  Found ${itemFiles.length} item definition files.`);

    for (const file of itemFiles) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      console.log(`   Processing ${path.basename(file)} (${data.length} entries)...`);

      let upsertCount = 0;
      for (const item of data) {
        // Resolve Relations for Equipment Data
        if (item.equipment_data) {
          // Resolve Damage Type
          if (item.equipment_data.damage_type && typeof item.equipment_data.damage_type === 'string') {
            const dtId = damageTypeMap.get(item.equipment_data.damage_type);
            if (dtId) {
              item.equipment_data.damage_type = dtId;
            } else {
              console.warn(
                `\n   ⚠️  Warning: Damage Type '${item.equipment_data.damage_type}' not found for item '${item.slug}'.`
              );
              item.equipment_data.damage_type = null;
            }
          }
          // Resolve Weapon Properties
          if (item.equipment_data.properties && Array.isArray(item.equipment_data.properties)) {
            item.equipment_data.properties = item.equipment_data.properties
              .map((slug: string) => {
                const wpId = weaponPropMap.get(slug);
                if (!wpId) console.warn(`\n   ⚠️  Warning: Property '${slug}' not found for item '${item.slug}'.`);
                return wpId;
              })
              .filter(Boolean);
          }
        }

        // Idempotent Upsert
        const existing = await strapi.documents('api::item.item').findFirst({
          filters: { slug: item.slug },
        });

        const itemData = {
          ...item,
          publishedAt: new Date(),
        };

        if (existing) {
          await strapi.documents('api::item.item').update({
            documentId: existing.documentId,
            data: itemData,
          });
          process.stdout.write('.');
        } else {
          await strapi.documents('api::item.item').create({
            data: itemData,
          });
          process.stdout.write('+');
        }
        upsertCount++;
      }
      console.log(`\n   ✅ Synced ${upsertCount} items from ${path.basename(file)}.`);
    }

    console.log(`\n✨ \x1b[32mGenesis Molecules Load Complete!\x1b[0m\n`);
  } catch (error: any) {
    console.error('\n❌ Fatal Error:', error.message);
    if (error.details) {
      console.error('Validation Errors:', JSON.stringify(error.details, null, 2));
    }
    if (error instanceof Error) {
      console.error(error.stack);
    }
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
