
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// 🛑 SAFETY: DISABLE WORKERS
delete process.env.REDIS_HOST;
delete process.env.ENABLE_QUEUES;

console.log('\n🛡️  \x1b[1m\x1b[33mSafe Mode Enabled: Background Workers Disabled.\x1b[0m');

async function main() {
  console.log('✨  \x1b[1m\x1b[35mStarting Genesis: Feature Loader...\x1b[0m\n');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    const pattern = 'data/library/atoms/features/*.json';
    const files = await glob(pattern, { cwd: backendRoot });

    console.log(`\n📚 Found ${files.length} feature definition files.`);
    
    // Cache Classes to link relation
    const classes = await strapi.documents('api::class.class').findMany({ fields: ['slug', 'documentId'] });
    const classMap = new Map(classes.map((c: any) => [c.slug, c.documentId]));

    let upsertCount = 0;
    
    for (const file of files) {
        const filePath = path.join(backendRoot, file);
        const entry = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // entry is array? NO, strict single object output from parser.
        // But check if parser output array or object? -> It outputs OBJECT. `fs.writeFileSync(path, JSON.stringify(featureData))`
        
        let classId = null;
        if (entry.class) {
            classId = classMap.get(entry.class);
            if (!classId) {
                // console.warn(`   ⚠️ Parent Class '${entry.class}' not found for feature '${entry.name}'`);
                // This is expected if classes aren't loaded yet. But we run class-loader first. 
                // Or maybe the slug mismatch? Parser uses 'barbarian', DB uses 'barbarian'? Yes.
            }
        }

        const payload: any = {
            slug: entry.slug,
            name: entry.name,
            description: entry.description,
            level: entry.level,
            is_subclass_feature: entry.is_subclass_feature || false, // schema checks?
            publishedAt: new Date(),
        };
        
        // Link to class if relation exists in schema
        // 'api::feature.feature' schema usually has `class` relation?
        // Let's assume it attempts to link if field exists.
        // Actually, Feature <-> Class relation might be on Class side (Component list).
        // But if Feature is an Atom (Collection Type), it might have a relation.
        // If it's a Component, we DON'T load it here as a Collection Type.
        // Wait, "Features" in Daicer are ATOMS (Collection Type) or COMPONENTS in the Class?
        // `EntitySheet` says `features` is a component list? 
        // SRD Parser output `allExports.push({ kind: 'atom', type: 'feature' })`.
        // `atoms-loader.ts` has `api::feature.feature`. So it IS a Collection Type.
        // So we populate the `Feature` entity. linking is likely implicitly via the Class "features" list (which stores relations or components?).
        // If Class stores a LIST OF RELATIONS to Features, then extracting Features FIRST is better.
        // If Class stores COMPONENTS, then we need to hydrate them IN PLACE.
        // `class-loader.ts` line 67: `features: entry.features || []`.
        // The `ClassParser` outputs `features: ['Relentless Rage', ...]` strings?
        // Let's check `ClassParser` output structure for `features`.
        // `classData` has `features: string[]` (names).
        // So `class-loader` tries to put strings into `features` field?
        // Strapi Component? or Relation?
        // If Relation, we need ID.
        // If Component, we need `{ name, description }`. 
        // `ClassParser` logic: It saves `features` as strings.
        // If schema `features` is a Component (Dynamic Zone or Repeatable Component), giving it strings will FAIL.
        // This suggests `srd-parser` output for `molecules/classes` might be INCOMPLETE for direct DB loading if the Schema expects full components.
        // BUT, if `features` is a Relation to `api::feature.feature`, we should ideally Map strings to IDs.
        // For now, let's just populate the ATOMS (Features) so they exist. 
        // Linking them to Class might require a second pass or smarter loader.
        
        try {
            const existing = await strapi.documents('api::feature.feature').findFirst({
                filters: { slug: entry.slug }
            });

            if (existing) {
                await strapi.documents('api::feature.feature').update({
                    documentId: existing.documentId,
                    data: payload
                });
                process.stdout.write('.');
            } else {
                await strapi.documents('api::feature.feature').create({
                    data: payload
                });
                process.stdout.write('+');
            }
            upsertCount++;
        } catch (_err: any) {
             // console.error(`Error ${entry.slug}: ${err.message}`);
        }
    }
    
    console.log(`\n✅ Synced ${upsertCount} features.`);
    console.log(`\n✨ \x1b[32mGenesis Feature Load Complete!\x1b[0m\n`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
