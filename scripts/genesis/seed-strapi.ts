/* eslint-disable */
process.env.AUTO_EMBEDDING_ENABLED = 'false';
process.env.ENABLE_QUEUES = 'false';
process.env.CRON_ENABLED = 'false';

import { createStrapi } from '@strapi/strapi';
import fs from 'fs/promises';
import path from 'path';

// Topological Order for Seeding to maintain referential integrity
// Topological Order for Seeding to maintain referential integrity
const SEED_ORDER = [
  // 1. Atoms (No Dependencies)
  { name: 'tag', uid: 'api::tag.tag' },
  { name: 'language', uid: 'api::language.language' },
  { name: 'size', uid: 'api::size.size' },
  { name: 'damage-type', uid: 'api::damage-type.damage-type' },
  { name: 'magic-school', uid: 'api::magic-school.magic-school' },
  { name: 'weapon-property', uid: 'api::weapon-property.weapon-property' },
  { name: 'status-effect', uid: 'api::status-effect.status-effect' },
  { name: 'terrain', uid: 'api::terrain.terrain' },
  { name: 'background', uid: 'api::background.background' },
  { name: 'trait', uid: 'api::trait.trait' },
  { name: 'proficiency', uid: 'api::proficiency.proficiency' },
  { name: 'prompt', uid: 'api::prompt.prompt' },
  { name: 'knowledge-source', uid: 'api::knowledge-source.knowledge-source' },
  { name: 'knowledge-snippet', uid: 'api::knowledge-snippet.knowledge-snippet' },

  // 2. Components (May depend on Atoms)
  { name: 'spell', uid: 'api::spell.spell' },
  { name: 'item', uid: 'api::item.item' },
  { name: 'action', uid: 'api::action.action' },

  // 3. Molecules (May depend on Atoms & Components)
  { name: 'feature', uid: 'api::feature.feature' },
  { name: 'race', uid: 'api::race.race' },
  { name: 'class', uid: 'api::class.class' },
  { name: 'subclass', uid: 'api::subclass.subclass' },

  // 4. Archetypes (Depend on everything)
  { name: 'entity', uid: 'api::entity.entity' },
];

/**
 * Keys in the JSON payloads that represent Relational fields.
 * Any string value found under these keys will be dynamically replaced
 * with its corresponding Strapi 5 documentId from the MemoryMap.
 */
const RELATION_TARGET_UIDS: Record<string, string> = {
  damage_type: 'api::damage-type.damage-type',
  properties: 'api::weapon-property.weapon-property',
  school: 'api::magic-school.magic-school',
  actions: 'api::action.action',
  legendary_actions: 'api::action.action',
  action: 'api::action.action',
  spells: 'api::spell.spell',
  spell: 'api::spell.spell',
  traits: 'api::trait.trait',
  trait: 'api::trait.trait',
  features: 'api::feature.feature',
  feature: 'api::feature.feature',
  items: 'api::item.item',
  item: 'api::item.item',
  proficiencies: 'api::proficiency.proficiency',
  proficiency: 'api::proficiency.proficiency',
  skills: 'api::proficiency.proficiency',
  saving_throws: 'api::proficiency.proficiency',
  equipment: 'api::item.item',
  tags: 'api::tag.tag',
  tag: 'api::tag.tag',
  languages: 'api::language.language',
  language: 'api::language.language',
  race: 'api::race.race',
  races: 'api::race.race',
  class: 'api::class.class',
  classes: 'api::class.class',
  subclass: 'api::subclass.subclass',
  subclasses: 'api::subclass.subclass',
  terrains: 'api::terrain.terrain',
  knowledge_sources: 'api::knowledge-source.knowledge-source',
  knowledge_source: 'api::knowledge-source.knowledge-source',
  entities: 'api::entity.entity',
};

// Memory Map to hold slug -> documentId AND UID:slug -> documentId
const MemoryMap: Record<string, string> = {};

/**
 * Recursively scans an object and replaces strings under mapped payload keys
 * with their corresponding documentId from the MemoryMap.
 * Also totally strips 'null' fields, empty objects, and 'id' keys
 * to prevent Strapi Yup Validation and unique constraint crashes.
 */
function resolveRelationsAndCleanNulls(obj: any, localizedUids: Set<string>): any {
  if (Array.isArray(obj)) {
    // Filter out nulls from arrays just in case, then map
    const mapped = obj.filter((item) => item !== null).map((item) => resolveRelationsAndCleanNulls(item, localizedUids));
    return mapped; // arrays of primitives or clean objects
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    let hasKeys = false;
    for (const [key, value] of Object.entries(obj)) {
      // 1. Strip raw components IDs to prevent Postgres unique constraint errors
      if (key === 'id') continue;

      // 2. Strip nulls to please Strapi validator
      if (value === null) continue;

      let cleanedValue = value;

      if (key in RELATION_TARGET_UIDS || typeof value === 'string') {
        // Only process string keys conditionally if mapped, else proceed to object traversal.
        // Wait, if it's NOT in RELATION_TARGET_UIDS, it will skip below block if array/string.
      }

      if (key in RELATION_TARGET_UIDS) {
        if (Array.isArray(value)) {
          cleanedValue = value
            .map((slug: any) => {
              if (typeof slug === 'string') {
                const targetUid = RELATION_TARGET_UIDS[key];
                const id = MemoryMap[`${targetUid}:${slug}`];
                const isLoc = localizedUids.has(targetUid);
                return id ? (isLoc ? { documentId: id, locale: 'en' } : { documentId: id }) : undefined;
              }
              // If it's an object, it's likely a nested component not a direct relation string.
              // We should clean it recursively.
              return resolveRelationsAndCleanNulls(slug, localizedUids);
            })
            .filter((item: any) => item !== undefined); // Drop unresolved dependencies
        } else if (typeof value === 'string') {
          const targetUid = RELATION_TARGET_UIDS[key];
          const id = MemoryMap[`${targetUid}:${value}`];
          const isLoc = localizedUids.has(targetUid);
          cleanedValue = id ? (isLoc ? { documentId: id, locale: 'en' } : { documentId: id }) : undefined;
        }
      } else if (typeof value === 'object') {
        cleanedValue = resolveRelationsAndCleanNulls(value, localizedUids);
      }

      // 3. Strip totally empty objects post-clean, which break "required" field validators
      // if passed as an object instead of being completely omitted.
      if (cleanedValue === undefined || cleanedValue === null) continue;
      if (typeof cleanedValue === 'object' && !Array.isArray(cleanedValue) && Object.keys(cleanedValue).length === 0) {
        continue;
      }

      // 4. Bulletproof Structural Patches for LLM Hallucinations
      if (key === 'save' && typeof cleanedValue === 'object') {
        const saveObj = cleanedValue as any;
        if (!saveObj.dc || !saveObj.stat) continue; // Must have both
      }
      if (key === 'condition_instances' && Array.isArray(cleanedValue)) {
        cleanedValue = cleanedValue.filter((c: any) => c && typeof c.chance === 'number' && c.chance >= 1);
        if ((cleanedValue as any[]).length === 0) continue;
      }
      if (key === 'last_run' && cleanedValue === '') {
        continue; // Prevent ISO timestamp validation crash
      }
      if (
        (key === 'material' || key === 'material_description' || key === 'condition' || key === 'description') &&
        typeof cleanedValue === 'string'
      ) {
        cleanedValue = cleanedValue.substring(0, 254);
      }
      if (typeof cleanedValue === 'number' && cleanedValue > 1000000) {
        continue; // Drop absurd integers that crash Postgres `integer` limits
      }
      if (typeof cleanedValue === 'number' && isNaN(cleanedValue)) {
        continue;
      }
      if (typeof cleanedValue === 'string' && cleanedValue.match(/^\d{4}-\d{2}-\d{2}/)) {
        try {
          cleanedValue = new Date(cleanedValue).toISOString();
        } catch (e) {
          continue; // drop invalid dates
        }
      }

      newObj[key] = cleanedValue;
      hasKeys = true;
    }
    return hasKeys ? newObj : undefined; // return undefined if outer object became completely empty
  }
  return obj;
}

async function runSeeder() {
  console.log('🚀 Booting Headless Strapi (Document Service)...');

  const strapi = createStrapi({
    appDir: process.cwd(),
    distDir: path.join(process.cwd(), 'dist'),
    autoReload: false,
    serveAdminPanel: false,
  });

  await strapi.load();
  console.log('✅ Strapi Context Loaded.');

  const localizedUids = new Set<string>();
  for (const step of SEED_ORDER) {
    const model = strapi.getModel(step.uid as any);
    if ((model?.pluginOptions as any)?.i18n?.localized === true) {
      localizedUids.add(step.uid);
    }
  }

  let insertedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const step of SEED_ORDER) {
    console.log(`\n📦 Migrating Schema: [${step.uid}]`);
    const collectionDir = path.join(process.cwd(), 'src/data/blueprints', step.name);

    // Ensure directory exists, some might be empty
    try {
      await fs.access(collectionDir);
    } catch {
      console.log(`   ⏭️ Directory not found. Skipping.`);
      continue;
    }

    const files = (await fs.readdir(collectionDir)).filter((f) => f.endsWith('.json'));
    const model = strapi.getModel(step.uid as any);
    const supportsDraftAndPublish = model.options?.draftAndPublish === true;
    const supportsI18n = (model.pluginOptions as any)?.i18n?.localized === true;

    for (const file of files) {
      const raw = await fs.readFile(path.join(collectionDir, file), 'utf-8');
      let data = JSON.parse(raw);

      // Critical Safety: Resolve explicit relational slugs to Strapi Document IDs
      data = resolveRelationsAndCleanNulls(data, localizedUids);

      // Critical Safety 2: Sanitize Unuploaded Media String Fields
      // Raw url strings from scraping crash strapi.documents media relations
      delete data.image;
      delete data.icon;
      delete data.avatar;
      delete data.url;
      delete data.cover;

      if (!data.slug) {
        console.log(`   ⚠️ Skipping ${file} due to missing slug.`);
        continue;
      }

      try {
        // Determine finding payload based on i18n
        const findFilters: any = { slug: data.slug };
        if (supportsI18n) findFilters.locale = 'en';

        console.log(`   -> [${data.slug}] Querying existing document...`);
        // Check Idempotency via Document Service
        const existingDocs = await strapi.documents(step.uid as any).findMany({
          filters: findFilters,
        });

        if (existingDocs && existingDocs.length > 0) {
          console.log(`   -> [${data.slug}] Already exists (${existingDocs.length} matching). Hard Re-creating...`);

          try {
            // Nuke the corrupted locale-locked row from postgres immediately
            for (const doc of existingDocs) {
              await strapi.documents(step.uid as any).delete({ documentId: doc.documentId });
            }

            // Recreate freshly fully sanitized with proper locale
            const createParams: any = { data };
            if (supportsDraftAndPublish) createParams.status = 'published';
            if (supportsI18n) createParams.locale = 'en';

            const inserted = await strapi.documents(step.uid as any).create(createParams);
            MemoryMap[`${step.uid}:${data.slug}`] = inserted.documentId;
            MemoryMap[data.slug] = inserted.documentId;
            skippedCount++; // count as updated/skipped
          } catch (updateErr: any) {
            console.error(`   ❌ INNER DOC DELETE/UPDATE FAILED for ${data.slug}:`, updateErr);
            failedCount++;
            if (updateErr.name !== 'ValidationError') break;
          }
        } else {
          const createParams: any = { data };
          if (supportsDraftAndPublish) {
            createParams.status = 'published';
          }
          if (supportsI18n) {
            createParams.locale = 'en';
          }

          console.log(`   -> [${data.slug}] Creating new document via Document Engine...`);
          try {
            const inserted = await strapi.documents(step.uid as any).create(createParams);
            console.log(`   -> [${data.slug}] Created successfully (ID: ${inserted.documentId}).`);
            MemoryMap[`${step.uid}:${data.slug}`] = inserted.documentId;
            MemoryMap[data.slug] = inserted.documentId;
            insertedCount++;
          } catch (innerErr: any) {
            console.error(`   ❌ INNER DOC CREATE FAILED for ${data.slug}:`, innerErr);
            failedCount++;
            // Deliberately break loop to avoid postgres corruption cascading errors
            if (innerErr.name !== 'ValidationError') {
              break;
            }
          }
          // Add delay to prevent postgres pipelining queue limits
          await new Promise((r) => setTimeout(r, 20));
        }
      } catch (err: any) {
        // If the first insert fails, it could abort the Postgres transaction. Log it loudly.
        console.error(`   ❌ Failed to process ${data.slug}: ${err.message}`);
        failedCount++;
      }
    }
  }

  console.log(`\n🏁 Seed Complete!`);
  console.log(`   ✅ Inserted: ${insertedCount}`);
  console.log(`   ⏭️ Skipped (Already Exists): ${skippedCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  console.log(`Closing Strapi connection...`);

  strapi.destroy();
  process.exit(0);
}

runSeeder().catch((err) => {
  console.error(err);
  process.exit(1);
});
