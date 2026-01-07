export {};
const dotenv = require('dotenv');
const path = require('path');

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { JuicyProgressBar } from './utils/progressBar';

const ENTITY_MODELS = [
  'api::character.character',
  'api::class.class',
  'api::damage-type.damage-type',
  'api::equipment.equipment',
  'api::equipment-category.equipment-category',
  'api::feature.feature',
  'api::language.language',
  'api::magic-item.magic-item',
  'api::magic-school.magic-school',
  'api::monster.monster',
  'api::proficiency.proficiency',
  'api::race.race',
  'api::spell.spell',
  'api::subclass.subclass',
  'api::trait.trait',
  'api::weapon-property.weapon-property',
  'api::knowledge-source.knowledge-source',
];

const BATCH_CONCURRENCY = 16;

// Main Execution
async function main() {
  console.log('\n🍹 \x1b[1m\x1b[36mStarting "Juicy" Game Entity Ingestion (Optimized)...\x1b[0m\n');

  // HACK: Fix CWD for Strapi auto-loader
  const backendRoot = path.resolve(__dirname, '../..');
  process.chdir(backendRoot);

  // Initialize Strapi
  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  // Inject service (since it expects global strapi in standalone or we just import it)
  // Our service expects global `strapi` or we need to pass it?
  // It declares `declare var strapi: any;` so assuming global injection by `createStrapi().load()`?
  // Strapi 5 usually sets global.strapi. Let's verify.
  // Ideally we should have passed strapi instance, but the service is written as singleton.

  const { entityKnowledgeService } = require('../services/entity-knowledge-service');

  try {
    for (const model of ENTITY_MODELS) {
      const typeName = model.split('.')[1];
      const friendlyName = typeName.charAt(0).toUpperCase() + typeName.slice(1);

      // 1. Fetch All IDs only (lightweight)
      const entries = await strapi.entityService.findMany(model as any, {
        fields: ['id'],
        limit: -1, // No limit
      });

      const total = Array.isArray(entries) ? entries.length : (entries as any).length || 0;

      if (total === 0) {
        console.log(`\x1b[33m[SKIP] ${friendlyName}: No entries found.\x1b[0m`);
        continue;
      }

      // 2. Initialize Progress Bar
      const bar = new JuicyProgressBar(total, friendlyName, 30);
      bar.start();

      // 3. Process in Batches
      const ids: number[] = Array.isArray(entries) ? entries.map((e: any) => e.id) : [];

      for (let i = 0; i < ids.length; i += BATCH_CONCURRENCY) {
        const batch = ids.slice(i, i + BATCH_CONCURRENCY);

        // Run batch
        await Promise.all(
          batch.map(async (id) => {
            try {
              if (model === 'api::knowledge-source.knowledge-source') {
                const service = strapi.service('api::knowledge-source.knowledge-source');
                if (service && service.sync) {
                  await service.sync(id);
                } else {
                  console.warn('KnowledgeSource service sync not found');
                }
              } else {
                await entityKnowledgeService.syncEntity(model, id);
              }
            } catch (err: any) {
              // Silent fail on individual to keep flow, logging to file maybe?
              // For juice, just keep going or print tiny error line?
              // console.error(`Failed ${id}`);
            }
          })
        );

        bar.increment(batch.length);
      }

      bar.finish();
    }

    console.log('\n✅ \x1b[32mIngestion Complete! All entities embedded and indexed.\x1b[0m\n');
  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    // Shutdown
    await strapi.destroy();
    process.exit(0);
  }
}

main();
