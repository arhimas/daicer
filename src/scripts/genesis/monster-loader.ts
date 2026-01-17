
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
  console.log('✨  \x1b[1m\x1b[35mStarting Genesis: Monster Loader...\x1b[0m\n');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    const pattern = process.argv[2] || 'data/library/blueprints/monsters-batch-*.json';
    const files = await glob(pattern, { cwd: backendRoot });

    console.log(`\n📚 Found ${files.length} monster blueprint files.`);
    
    // --- 1. Load Item Library for Smart Matching (Fuzzy Match) ---
    // We load the raw JSONs to get the base definitions (damage dice, etc)
    const itemFiles = await glob('data/library/molecules/items/*.json', { cwd: backendRoot });
    const libraryItems = new Map<string, any>(); 
    
    for (const f of itemFiles) {
        const d = JSON.parse(fs.readFileSync(path.join(backendRoot, f), 'utf-8'));
        if (Array.isArray(d)) {
            d.forEach(i => libraryItems.set(i.name.toLowerCase(), i));
        }
    }
    console.log(`📚 Loaded ${libraryItems.size} library items for smart matching.`);
    
    // Store generated variants to persist them later
    const generatedVariants: any[] = [];

    // Load DB Item Map for Inventory (Slugs -> IDs) to quickly find existing DB items
    // We need to refresh this map as we create new variant items
    const refreshItemMap = async () => {
         const items = await strapi.documents('api::item.item').findMany({ fields: ['slug', 'documentId'] });
         return new Map(items.map((i: any) => [i.slug, i.documentId]));
    };
    let dbItemMap = await refreshItemMap();
        
    for (const file of files) {
        const filePath = path.join(backendRoot, file);
        const filename = path.basename(file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        console.log(`   Processing \x1b[33m${filename}\x1b[0m (${data.length} entries)...`);

        let upsertCount = 0;
        let skipCount = 0;
        
        for (const entry of data) {
            
            // 2. Process Actions & Smart Equip
            const actionIds: string[] = [];
            const inventoryComponent: any[] = [];
            
            // Pre-process existing inventory
            if (entry.inventory && Array.isArray(entry.inventory)) {
                 entry.inventory.forEach((inv: any) => inventoryComponent.push(inv));
            }

            if (entry.actions && Array.isArray(entry.actions)) {
                for (const act of entry.actions) {
                    
                    // --- SMART EQUIP LOGIC ---
                    // Check if this action looks like an item
                    const cleanName = act.name.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim(); // Remove (Two-Handed) etc
                    const libraryItem = libraryItems.get(cleanName);
                    
                    if (libraryItem && act.type.toLowerCase().includes('weapon')) {
                         // Candidate for Smart Equip!
                         let useItem = true;
                         let targetItemSlug = libraryItem.slug;

                         // Compare Stats (Damage Dice)
                         // Monster Action: "3d8 + 5" -> Dice: "3d8"
                         // Library Item: "1d8"
                         const monsterDamage = act.damage_instances?.[0]?.amount?.match(/^(\d+d\d+)/)?.[1];
                         const itemDamage = libraryItem.equipment_data?.damage_dice;

                         if (monsterDamage && itemDamage && monsterDamage !== itemDamage) {
                             // VARIANT REQUIRED
                             // E.g. "greatclub-hill-giant"
                             const variantSlug = `${libraryItem.slug}-${entry.slug}`; // greatclub-hill-giant
                             targetItemSlug = variantSlug;
                             
                             // Check if variant exists in DB, if not create it
                             if (!dbItemMap.has(variantSlug)) {
                                 // Create Variant Item in Memory
                                 const variantPayload = {
                                     ...libraryItem,
                                     slug: variantSlug,
                                     name: `${libraryItem.name} (${entry.name})`,
                                     equipment_data: {
                                         ...libraryItem.equipment_data,
                                         damage_dice: monsterDamage // Override dice
                                     },
                                 };
                                 
                                 // Add to persistent list for library saving
                                 // Check if we already added it to the batch list to avoid dups
                                 const alreadyInBatch = generatedVariants.find(v => v.slug === variantSlug);
                                 if (!alreadyInBatch) {
                                     generatedVariants.push(variantPayload);
                                 }
                                 
                                 // Upsert Item directly to DB as well for this run
                                 try {
                                     const newItem = await strapi.documents('api::item.item').create({
                                         data: variantPayload as any
                                     });
                                     dbItemMap.set(variantSlug, newItem.documentId);
                                     console.log(`      🛠️  Created Variant Item: \x1b[36m${variantSlug}\x1b[0m (${monsterDamage})`);
                                 } catch(e) {
                                     console.warn(`      ⚠️ Failed to create variant ${variantSlug}, falling back to Action. ${e.message}`);
                                     useItem = false;
                                 }
                             }
                         }

                         if (useItem) {
                             // Add to Inventory (Equipped)
                             const itemId = dbItemMap.get(targetItemSlug);
                             if (itemId) {
                                 // Check if already in inventory
                                 const exists = inventoryComponent.find(i => i.item === itemId || (dbItemMap.get(i.item as string) === itemId));
                                 if (!exists) {
                                     inventoryComponent.push({
                                         item: itemId,
                                         quantity: 1,
                                         slot: 'main_hand', // Assumption
                                         isEquipped: true
                                     });
                                    //  console.log(`      ⚔️  Smart Equipped: ${targetItemSlug}`);
                                 }
                                 continue; // SKIP Creating Action (Engine will hydrate it)
                             }
                         }
                    } 
                    
                    // --- FALLBACK: CREATE RAW ACTION ---
                    
                    const uniqueSlug = `${entry.slug}-${act.name.toLowerCase().replace(/\s+/g, '-')}`;

                    // Parsing Logic for Range
                    let range: any = act.range_config;
                    if (range && range.type === 'Melee') {
                        range = { ...range, type: 'Ranged (Feet)', distance: range.distance || 5 }; 
                    } else if (range && range.type === 'Self') {
                        range = { type: 'Self', distance: 0 };
                    }

                    // Parsing Logic for Damage
                    const damageInstances: any[] = [];
                    if (act.damage_instances) {
                        for (const di of act.damage_instances) {
                             const match = di.amount.match(/^(\d+)d(\d+)\s*\+?\s*(\d+)?$/);
                             if (match) {
                                  const typeCapitalized = di.type.charAt(0).toUpperCase() + di.type.slice(1);
                                  damageInstances.push({
                                      effect_type: 'Damage',
                                      damage_type: typeCapitalized,
                                      dice_count: parseInt(match[1]),
                                      dice_value: parseInt(match[2]),
                                      flat_bonus: match[3] ? parseInt(match[3]) : 0,
                                      timing: 'Instant'
                                  });
                             }
                        }
                    }

                    // Parsing Logic for Conditions
                    const conditionInstances: any[] = [];
                    if (act.condition_instances) {
                        for (const ci of act.condition_instances) {
                             const condName = ci.id.charAt(0).toUpperCase() + ci.id.slice(1);
                             let desc = "";
                             if (ci.dc) desc += `DC ${ci.dc} ${ci.save_type?.toUpperCase() || ''} Save`;
                             
                             conditionInstances.push({
                                 condition: condName,
                                 description: desc || undefined,
                                 chance: 100,
                                 duration_rounds: ci.duration || undefined
                             });
                        }
                    }

                    const actionPayload = {
                        name: `${entry.name} ${act.name}`, // e.g. "Goblin Scimitar"
                        slug: uniqueSlug,
                        type: (() => {
                            const t = act.type.toLowerCase();
                            if (t.includes('spell')) return 'spell';
                            if (t.includes('melee')) return 'melee';
                            if (t.includes('ranged')) return 'ranged';
                            if (t.includes('multiattack')) return 'ability';
                            return 'ability';
                        })(),
                        toHit: act.toHit,
                        range_config: range,
                        damage_instances: damageInstances,
                        condition_instances: conditionInstances,
                        save: act.save ? { dc: act.save.dc, stat: act.save.stat || act.save.type } : null,
                    } as any;

                    // Upsert Action
                    const existingAction = await strapi.documents('api::action.action').findFirst({
                        filters: { slug: uniqueSlug }
                    });

                    if (existingAction) {
                        await strapi.documents('api::action.action').update({
                            documentId: existingAction.documentId,
                            data: actionPayload
                        });
                        actionIds.push(existingAction.documentId);
                    } else {
                        const newAction = await strapi.documents('api::action.action').create({
                            data: actionPayload
                        });
                        actionIds.push(newAction.documentId);
                    }
                }
            }

            // 3. Process Inventory Component (Map Slugs to IDs)
            const finalInventory: any[] = [];
            for (const inv of inventoryComponent) {
                // Inv item might be slug string OR already ID (if came from smart equip)
                let itemId = inv.item;
                if (typeof itemId === 'string') {
                    // It's a slug, map it
                    itemId = dbItemMap.get(inv.item);
                }
                
                if (itemId) {
                    finalInventory.push({
                        item: itemId,
                        quantity: inv.quantity || 1,
                        slot: inv.slot || 'backpack',
                        isEquipped: inv.isEquipped || false
                    });
                } else {
                    console.warn(`      ⚠️ Unknown Item: ${inv.item} for ${entry.slug}`);
                }
            }

            // 4. Construct Entity Payload
            const payload: any = {
                slug: entry.slug,
                name: entry.name,
                type: entry.type,
                alignment: entry.alignment,
                size: entry.size,
                level: entry.level,
                ac: entry.ac,
                hp: entry.hp,
                hit_dice: entry.hit_dice,
                speed: entry.speed,
                challenge_rating: entry.challenge_rating,
                xp: entry.xp,
                stats: entry.stats, // component
                actions: actionIds, // relation
                inventory: finalInventory, // component
            } as any;

            try {
                const existing = await strapi.documents('api::entity.entity').findFirst({
                    filters: { slug: entry.slug }
                });

                if (existing) {
                    await strapi.documents('api::entity.entity').update({
                        documentId: existing.documentId,
                        data: payload
                    });
                    process.stdout.write('.');
                    skipCount++;
                } else {
                    await strapi.documents('api::entity.entity').create({
                        data: payload
                    });
                    process.stdout.write('+');
                    upsertCount++;
                }
            } catch (err: any) {
                 console.error(`\n      ❌ Error ingesting ${entry.slug}:`);
                 console.error(`         Message: ${err.message}`);
                 if (err.details) console.error(`         Details: ${JSON.stringify(err.details, null, 2)}`);
                 else console.error(`         Raw: ${JSON.stringify(err)}`);
            }
        }
        console.log(`\n   ✅ Synced ${upsertCount} new monsters, updated ${skipCount} existing from ${filename}.`);
    }

    // --- 5. Persist Generated Variants to Library ---
    if (generatedVariants.length > 0) {
        const variantFile = 'data/library/molecules/items/generated-variants.json';
        const variantPath = path.join(backendRoot, variantFile);
        let existingVariants: any[] = [];
        if (fs.existsSync(variantPath)) {
            existingVariants = JSON.parse(fs.readFileSync(variantPath, 'utf-8'));
        }

        // Merge new variants (avoid duplicates)
        for (const newVar of generatedVariants) {
            if (!existingVariants.find(v => v.slug === newVar.slug)) {
                existingVariants.push(newVar);
            }
        }
        
        // Sort for stability
        existingVariants.sort((a, b) => a.slug.localeCompare(b.slug));

        // Write to disk
        fs.writeFileSync(variantPath, JSON.stringify(existingVariants, null, 2));
        console.log(`\n💾 Saved ${generatedVariants.length} new variant items to \x1b[36m${variantFile}\x1b[0m`);
    }

    console.log(`\n✨ \x1b[32mGenesis Monster Load Complete!\x1b[0m\n`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
