export {};
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';


// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
// 🛑 SAFETY: DISABLE WORKERS TO PREVENT RAM EXPLOSION
delete process.env.REDIS_HOST;
delete process.env.ENABLE_QUEUES;

interface AtomDefinition {
  file: string;
  uid: string;
  name: string;
  uniqueKey?: string;
}

const ATOMS: AtomDefinition[] = [
  {
    file: 'damage-types.json',
    uid: 'api::damage-type.damage-type',
    name: 'Damage Types',
  },
  {
    file: 'magic-schools.json',
    uid: 'api::magic-school.magic-school',
    name: 'Magic Schools',
  },
  {
    file: 'conditions.json',
    uid: 'api::status-effect.status-effect',
    name: 'Status Effects',
  },
  {
    file: 'weapon-properties.json',
    uid: 'api::weapon-property.weapon-property',
    name: 'Weapon Properties',
  },
  {
    file: 'languages.json',
    uid: 'api::language.language',
    name: 'Languages',
  },
  {
    file: 'proficiencies.json',
    uid: 'api::proficiency.proficiency',
    name: 'Proficiencies',
  },
  {
    file: 'equipment-categories.json',
    uid: 'api::equipment-category.equipment-category',
    name: 'Equipment Categories',
  },
  {
    file: 'traits.json',
    uid: 'api::trait.trait',
    name: 'Traits',
  },
  {
    file: 'features.json',
    uid: 'api::feature.feature',
    name: 'Features',
  },
  {
    file: 'prompts.json',
    uid: 'api::prompt.prompt',
    name: 'Prompts',
    uniqueKey: 'key'
  }
];


export async function loadAtoms(strapi: any) {
  console.log('\n⚛️  \x1b[1m\x1b[36mStarting Genesis: Atoms Loader (L0)...\x1b[0m\n');

  // HACK: Fix CWD for Strapi auto-loader if running from script, 
  // but if called from CLI/Queue, CWD might already be correct. 
  // We'll assume the caller passes a valid Strapi instance.

  const backendRoot = path.resolve(__dirname, '../../..');

  try {
    for (const atom of ATOMS) {
      console.log(`\n📦 Processing \x1b[33m${atom.name}\x1b[0m...`);
      const filePath = path.join(backendRoot, 'data/library/atoms', atom.file);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`   ⚠️ File not found: ${filePath}`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`   found ${data.length} entries.`);

      let upsertCount = 0;
      for (const entry of data) {
        // Auto-generate slug if missing, ONLY if uniqueKey is NOT set or IS slug
        const keyField = atom.uniqueKey || 'slug';

        if (keyField === 'slug' && !entry.slug && entry.name) {
            entry.slug = entry.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }

        if (!entry[keyField]) {
            console.warn(`      ⚠️ Skipping entry without ${keyField}: ${JSON.stringify(entry)}`);
            continue;
        }

        // Idempotent Upsert based on keyField
        const existing = await strapi.documents(atom.uid as any).findFirst({
            filters: { [keyField]: entry[keyField] }
        });

        if (existing) {
            // Update
            await strapi.documents(atom.uid as any).update({
                documentId: existing.documentId,
                data: entry
            });
            process.stdout.write('.');
        } else {
            // Create
            await strapi.documents(atom.uid as any).create({
                data: {
                    ...entry,
                    publishedAt: new Date(), // Always publish Atoms
                }
            });
            process.stdout.write('+');
        }
        upsertCount++;
      }
      console.log(`\n   ✅ Synced ${upsertCount} ${atom.name}.`);
    }

    console.log(`\n✨ \x1b[32mGenesis Atoms Load Complete!\x1b[0m\n`);
    return { success: true };

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
    throw error;
  }
}

// Self-execution if run directly
if (require.main === module) {
  (async () => {
      // 1. Load Environment Variables
      // dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
      // delete process.env.REDIS_HOST;
      // delete process.env.ENABLE_QUEUES;

      const backendRoot = path.resolve(__dirname, '../../..');
      process.chdir(backendRoot);

      const { createStrapi } = await import('@strapi/strapi');
      const strapi = await createStrapi({
        appDir: backendRoot,
        distDir: 'dist',
      }).load();

      await loadAtoms(strapi);
      await strapi.destroy();
      process.exit(0);
  })();
}
