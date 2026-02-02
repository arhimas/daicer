export {};
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  console.log('\n⚔️  \x1b[1m\x1b[36mStarting Genesis: Items Loader (L1)...\x1b[0m\n');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    // -------------------------------------------------------------------------
    // 1. Build Lookups for Atoms (L0)
    // -------------------------------------------------------------------------
    console.log('🔎 Building Atom Lookups...');

    // A. Damage Types
    const damageTypes = await strapi.documents('api::damage-type.damage-type').findMany({
      fields: ['slug', 'documentId'],
    });
    const damageTypeMap = new Map(damageTypes.map((dt: any) => [dt.slug, dt.documentId]));
    console.log(`   Mapped ${damageTypeMap.size} Damage Types.`);

    // B. Weapon Properties
    const weaponProps = await strapi.documents('api::weapon-property.weapon-property').findMany({
      fields: ['slug', 'documentId'],
      limit: 100,
    });
    const weaponPropMap = new Map(weaponProps.map((wp: any) => [wp.slug, wp.documentId]));
    console.log(`   Mapped ${weaponPropMap.size} Weapon Properties.`);

    // Debug: Log loaded properties if count is unexpected
    if (weaponPropMap.size < 10) {
      console.warn('   ⚠️ Warning: Partial Weapon Properties loaded:', Array.from(weaponPropMap.keys()));
    }

    // -------------------------------------------------------------------------
    // 2. Load Item Molecules
    // -------------------------------------------------------------------------
    const pattern = 'data/library/molecules/items/*.json';
    const files = await glob(pattern, { cwd: backendRoot });

    console.log(`\n📚 Found ${files.length} item definition files.`);

    for (const file of files) {
      const filePath = path.join(backendRoot, file);
      const filename = path.basename(file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(`   Processing \x1b[33m${filename}\x1b[0m (${data.length} entries)...`);

      let upsertCount = 0;
      for (const entry of data) {
        // RELATIONAL MAPPING
        if (entry.equipment_data) {
          // Map Damage Type
          if (entry.equipment_data.damage_type) {
            const dtSlug = entry.equipment_data.damage_type;
            const dtId = damageTypeMap.get(dtSlug);
            if (dtId) {
              entry.equipment_data.damage_type = dtId; // Replace Slug with ID
            } else {
              console.warn(`      ⚠️ Unknown Damage Type Slug: ${dtSlug}`);
              delete entry.equipment_data.damage_type;
            }
          }

          // Map Weapon Properties (Many-to-Many)
          if (entry.equipment_data.properties && Array.isArray(entry.equipment_data.properties)) {
            const mappedProps: string[] = [];
            for (const slug of entry.equipment_data.properties) {
              const propId = weaponPropMap.get(slug);
              if (propId) {
                mappedProps.push(propId);
              } else {
                console.warn(`      ⚠️ Unknown Weapon Property Slug: ${slug}`);
              }
            }
            entry.equipment_data.properties = mappedProps; // Replace Slugs with IDs
          }
        }

        // IDEMPOTENT UPSERT
        try {
          const existing = await strapi.documents('api::item.item').findFirst({
            filters: { slug: entry.slug },
          });

          if (existing) {
            await strapi.documents('api::item.item').update({
              documentId: existing.documentId,
              data: {
                ...entry,
                publishedAt: new Date(),
              },
            });
            process.stdout.write('.');
          } else {
            await strapi.documents('api::item.item').create({
              data: {
                ...entry,
                publishedAt: new Date(),
              },
            });
            process.stdout.write('+');
          }
          upsertCount++;
        } catch (err) {
          console.error(`\n      ❌ Error ingesting ${entry.slug}:`, err);
        }
      }
      console.log(`\n   ✅ Synced ${upsertCount} items from ${filename}.`);
    }

    console.log(`\n✨ \x1b[32mGenesis Items Load Complete!\x1b[0m\n`);
  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
