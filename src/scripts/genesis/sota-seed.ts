
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  console.log('✨  \x1b[1m\x1b[32mStarting SOTA Seeder (Strict Relational Ingest)...\x1b[0m\n');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    const SEED_ROOT = path.join(process.cwd(), 'data/seed');
    
    // --- 0. Atoms: Damage Types ---
    const DAMAGE_TYPES = [
        'Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'
    ];
    console.log(`\n⚛️  Seeding ${DAMAGE_TYPES.length} Damage Types...`);
    for (const dt of DAMAGE_TYPES) {
        const slug = dt.toLowerCase();
        const existing = await strapi.documents('api::damage-type.damage-type').findFirst({ filters: { slug } });
        if (!existing) {
            await strapi.documents('api::damage-type.damage-type').create({
                data: {
                    name: dt,
                    slug,
                    description: `The ${dt} damage type.`,
                    publishedAt: new Date()
                } as any
            });
        }
    }
    console.log('✅ Damage Types Done.\n');

    // --- 1. Features First (Atoms) ---
    const featureFiles = await glob('features/*.json', { cwd: SEED_ROOT });
    console.log(`📚 Seeding ${featureFiles.length} features...`);
    
    for (const file of featureFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(SEED_ROOT, file), 'utf-8'));
        // Features are simple atoms
        await strapi.documents('api::feature.feature').create({
            data: {
                slug: data.slug,
                name: data.name,
                description: data.description,
                level: typeof data.level === 'string' ? parseInt(data.level) : data.level,
                is_subclass_feature: !!data.is_subclass_feature,
                lore: data.lore,
                publishedAt: new Date()
            } as any,
            status: 'published'
        }).catch(async (e) => {
             // Upsert fallback
             const existing = await strapi.documents('api::feature.feature').findFirst({ filters: { slug: data.slug } });
             if (existing) {
                 await strapi.documents('api::feature.feature').update({
                     documentId: existing.documentId,
                     data: { description: data.description, lore: data.lore } as any // Only update content
                 });
             }
        });
        process.stdout.write('.');
    }
    console.log('\n✅ Features Done.\n');

    // --- 2. Spells (Molecules) ---
    const spellFiles = await glob('spells/*.json', { cwd: SEED_ROOT });
    console.log(`📚 Seeding ${spellFiles.length} spells...`);
    
    for (const file of spellFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(SEED_ROOT, file), 'utf-8'));
        
        const payload = {
            slug: data.slug,
            name: data.name,
            level: parseInt(String(data.level)), // Ensure int
            school: data.school ? (data.school.charAt(0).toUpperCase() + data.school.slice(1)) : 'Evocation',
            description: data.description,
            lore: data.lore,
            
            // Component Mapping
            casting_config: {
                time_value: 1, // Default, logic to parse string '1 action' could go here if needed
                time_unit: 'Action',
                components: { verbal: true, somatic: true, material: false } // Placeholder or strict parse
            },
            // Note: In SOTA seed we assume data is clean or we map strict.
            // For now mapping direct fields.
            publishedAt: new Date()
        };

        const existing = await strapi.documents('api::spell.spell').findFirst({ filters: { slug: data.slug } });
        if (existing) {
            await strapi.documents('api::spell.spell').update({ documentId: existing.documentId, data: payload as any });
        } else {
            await strapi.documents('api::spell.spell').create({ data: payload as any });
        }
        process.stdout.write('.');
    }
    console.log('\n✅ Spells Done.\n');

    // --- 3. Items (Molecules) ---
    const itemFiles = await glob('items/*.json', { cwd: SEED_ROOT });
    console.log(`📚 Seeding ${itemFiles.length} items...`);
    
    for (const file of itemFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(SEED_ROOT, file), 'utf-8'));
        
        const payload = {
            slug: data.slug,
            name: data.name,
            rarity: data.rarity || 'Common', // Enum map
            type: 'Wondrous Item', // Enum map needed if strict
            description: data.description,
            lore: data.lore,
            publishedAt: new Date()
        };
         const existing = await strapi.documents('api::item.item').findFirst({ filters: { slug: data.slug } });
        if (existing) {
            await strapi.documents('api::item.item').update({ documentId: existing.documentId, data: payload as any });
        } else {
            await strapi.documents('api::item.item').create({ data: payload as any });
        }
        process.stdout.write('.');
    }
    console.log('\n✅ Items Done.\n');

    // --- 4. Classes (Molecules with Relations) ---
    const classFiles = await glob('classes/*.json', { cwd: SEED_ROOT });
    console.log(`📚 Seeding ${classFiles.length} classes...`);
    
    
    for (const file of classFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(SEED_ROOT, file), 'utf-8'));
        
        // Resolve Feature Relations!
        // We look for 'progression' or 'features' in the raw/seed data.
        // Assuming 'features' array of strings is present from parser, OR we infer from progression.
        let relatedFeatures: string[] = []; // Array of Document IDs

        // 1. Collect Slugs
        const featureSlugs = new Set<string>();
        if (Array.isArray(data.features)) {
            data.features.forEach((f: string) => featureSlugs.add(f));
        }
        if (Array.isArray(data.progression)) {
             data.progression.forEach((row: any) => {
                 // row.features is often array of strings ["Rage", "Unarmored Defense"]
                 if (Array.isArray(row.features)) {
                      row.features.forEach((fName: string) => {
                           // We need to slugify to match? Or precise match name?
                           // The seed features use normalized slug.
                           // Let's optimistic slugify.
                           const s = fName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                           featureSlugs.add(s);
                      });
                 }
             });
        }
        
        // 2. Resolve to IDs
        if (featureSlugs.size > 0) {
            const foundHeaders = await strapi.documents('api::feature.feature').findMany({
                filters: { slug: { $in: Array.from(featureSlugs) } },
                fields: ['documentId']
            });
            relatedFeatures = foundHeaders.map((f: any) => f.documentId);
        }

        const payload = {
            slug: data.slug,
            name: data.name,
            hit_die: String(data.hit_die), // Normalize to string
            lore: data.lore,
            features: relatedFeatures, // <--- THE CARDINALITY
            publishedAt: new Date()
        };

        const existing = await strapi.documents('api::class.class').findFirst({ filters: { slug: data.slug } });
        if (existing) {
            await strapi.documents('api::class.class').update({ documentId: existing.documentId, data: payload as any });
        } else {
            await strapi.documents('api::class.class').create({ data: payload as any });
        }
        process.stdout.write('.');
    }
    console.log('\n✅ Classes Done.\n');
    
    console.log(`\n✨ \x1b[32mSOTA Seeding Complete!\x1b[0m\n`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    // await strapi.destroy(); // Keep it alive lightly? No.
    // Logic: destroy() closes DB connections.
    try { await strapi.destroy(); } catch(e) {}
    process.exit(0);
  }
}

main();
