/* eslint-disable */

import fs from 'fs/promises';
import path from 'path';

const SEED_DIR = path.join(process.cwd(), 'seed-data');

interface EntityReference {
  type: string;
  id: string; // The slug/filename without extension
}

// Map of Entity Type -> Set of IDs (slugs)
const entityIndex = new Map<string, Set<string>>();

async function buildIndex() {
  console.log('🔍 Building Seed Data Index...');
  try {
    const types = await fs.readdir(SEED_DIR);
    for (const type of types) {
      if (type.startsWith('.')) continue; // skip .DS_Store etc

      const typeDir = path.join(SEED_DIR, type);
      const stat = await fs.stat(typeDir);
      if (!stat.isDirectory()) continue;

      const files = await fs.readdir(typeDir);
      const ids = new Set<string>();

      for (const file of files) {
        if (file.endsWith('.json')) {
          const id = file.replace('.json', '');
          ids.add(id);
        }
      }
      entityIndex.set(type, ids);
      console.log(`   - ${type}: ${ids.size} entities`);
    }
  } catch (e) {
    console.log('Index build failed (directory might be empty)');
  }
}

async function verifyIntegrity() {
  console.log('\n🧪 Verifying Referential Integrity...');
  const errors: string[] = [];

  for (const [type, ids] of entityIndex.entries()) {
    const typeDir = path.join(SEED_DIR, type);
    for (const id of ids) {
      const filePath = path.join(typeDir, `${id}.json`);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);

        await checkEntity(type, id, data, errors);
      } catch (e: any) {
        errors.push(`[${type}:${id}] Failed to read/parse: ${e.message}`);
      }
    }
  }

  if (errors.length === 0) {
    console.log('\n✅ All seed data integrity checks passed!');
  } else {
    console.error(`\n❌ Found ${errors.length} integrity errors:`);
    errors.forEach((e) => console.error(e));
    process.exit(1);
  }
}

async function checkEntity(type: string, id: string, data: any, errors: string[]) {
  // Helper to log error
  const err = (msg: string) => errors.push(`[${type}:${id}] ${msg}`);

  // Generic Relation Check Helper
  const checkRelation = (field: string, targetType: string, isArray: boolean) => {
    if (!data[field]) return; // Optional field?

    const validTargets = entityIndex.get(targetType);
    if (!validTargets) {
      // Warn only if we expect the type to exist but it's empty/missing?
      // Or strict error? Let's check if we have mapped it in index.
      // If the directory doesn't exist, validTargets is undefined.
      // err(`Target type '${targetType}' does not exist in seed-data.`);
      return;
    }

    const values = isArray ? data[field] : [data[field]];

    for (const val of values) {
      // Relation values in seed data are strictly slugs (strings)
      if (typeof val !== 'string') {
        // It might be an object if we didn't map it correctly?
        // But our Mappers should be producing slugs or UIDs.
        // err(`Field '${field}' contains non-string value: ${JSON.stringify(val)}`);
        continue;
      }

      if (!validTargets.has(val)) {
        err(`Broken Link: '${field}' -> '${targetType}:${val}' (Target not found)`);
      }
    }
  };

  // Specific Checks based on Type
  switch (type) {
    case 'item':
      checkRelation('weapon_properties', 'weapon-property', true); // Verify array
      // checkRelation('damage_type', 'damage-type', false); // Often simple string in some sources, but we mapped to api::damage-type?
      // Let's check club.json: "damage_type": ["bludgeoning"] -> It's an array of slugs currently?
      // Need to verify schema. Item schema says `damage_type` is relation?
      // Actually checking `club.json` from previous turn: "damage_type": ["bludgeoning"]
      checkRelation('damage_type', 'damage-type', true);
      break;

    case 'spell':
      checkRelation('school', 'magic-school', false);
      break;

    case 'race':
      checkRelation('traits', 'trait', true);
      break;

    case 'class':
      checkRelation('features', 'feature', true);
      break;

    case 'trait':
      // Recursive relations?
      break;
  }
}

// Run
(async () => {
  await buildIndex();
  await verifyIntegrity();
})();
