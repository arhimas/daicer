import { program } from 'commander';
import { SourceLoader } from '../../src/features/genesis-core/source-loader';
import { LLMBridge } from '../../src/features/genesis-core/llm-bridge';
import { JsonSchemaBuilder } from '../../src/features/genesis-core/json-schema-builder';
import { SchemaLoader } from '../../src/features/genesis-core/schema-loader';
import { DryRunService } from '../../src/features/genesis-core/dry-run-service';
import { SpellMapper } from '../../src/features/genesis-core/mappers/spell-mapper';
import { ItemMapper } from '../../src/features/genesis-core/mappers/item-mapper';
import { TraitMapper } from '../../src/features/genesis-core/mappers/trait-mapper';
import { FeatureMapper } from '../../src/features/genesis-core/mappers/feature-mapper';
import fs from 'fs/promises';
import path from 'path';

// Setup CLI
program
    .version('1.0.0')
    .description('Ingest 5e Data into Genesis Engine')
    .option('--limit <number>', 'Limit number of entities per type', '5')
    .action(async (options) => {
        try {
            console.log('🔮 Genesis Factory: 5e Ingestion Protocol Initiated...');
            
            const limit = parseInt(options.limit);
            const loader = new SourceLoader();
            const bridge = new LLMBridge();
            const strapiLoader = new SchemaLoader();
            const schemaBuilder = new JsonSchemaBuilder(strapiLoader);
            const dryRun = new DryRunService(strapiLoader);

            // Mappers
            const spellMapper = new SpellMapper();
            const itemMapper = new ItemMapper();
            const traitMapper = new TraitMapper();
            const featureMapper = new FeatureMapper();
            // Primitives
            const { DamageTypeMapper, ConditionMapper, MagicSchoolMapper, BackgroundMapper } = require('../../src/features/genesis-core/mappers/primitive-mappers');
            const damageTypeMapper = new DamageTypeMapper();
            const conditionMapper = new ConditionMapper();
            const magicSchoolMapper = new MagicSchoolMapper();
            const backgroundMapper = new BackgroundMapper();

            // 0. Primitives Ingestion
            console.log('\n🧱 Ingesting Primitives...');

            let count = 0;

            // Damage Types
            try {
                const damageTypes = await loader.loadDamageTypes();
                for (const dt of damageTypes) {
                     if (count >= limit) break; // Re-use limit or separate
                     console.log(`Generating Damage Type: ${dt.name}`);
                     const request = damageTypeMapper.map(dt);
                     console.log(`Building schema for ${dt.name}...`);
                     const jsonSchema = await schemaBuilder.build(request.uid);
                     console.log(`Generating content for ${dt.name}...`);
                     const result = await bridge.generateStructured(request.prompt, jsonSchema, { model: 'gemini-3-flash' });
                     console.log(`Validating ${dt.name}...`);
                     if ((await dryRun.validate(result, request.uid)).valid) {
                         await saveEntity('damage-type', dt.index, result);
                         console.log(`✅ Success: ${dt.name}`);
                     }
                     count++;
                }
            } catch (e: any) { console.log('Skipping Damage Types', e.message); }

            // Conditions
            count = 0;
            try {
                const conditions = await loader.loadConditions();
                for (const cond of conditions) {
                     if (count >= limit) break;
                     console.log(`Generating Condition: ${cond.name}`);
                     const request = conditionMapper.map(cond);
                     const jsonSchema = await schemaBuilder.build(request.uid);
                     const result = await bridge.generateStructured(request.prompt, jsonSchema, { model: 'gemini-3-flash' });
                     if ((await dryRun.validate(result, request.uid)).valid) {
                         await saveEntity('status-effect', cond.index, result);
                         console.log(`✅ Success: ${cond.name}`);
                     }
                     count++;
                }
            } catch (e: any) { console.log('Skipping Conditions', e.message); }

            // Magic Schools
            count = 0;
            try {
                const schools = await loader.loadMagicSchools();
                for (const sch of schools) {
                     if (count >= limit) break;
                     console.log(`Generating Magic School: ${sch.name}`);
                     const request = magicSchoolMapper.map(sch);
                     const jsonSchema = await schemaBuilder.build(request.uid);
                     const result = await bridge.generateStructured(request.prompt, jsonSchema, { model: 'gemini-3-flash' });
                     if ((await dryRun.validate(result, request.uid)).valid) {
                         await saveEntity('magic-school', sch.index, result);
                         console.log(`✅ Success: ${sch.name}`);
                     }
                     count++;
                }
            } catch (e: any) { console.log('Skipping Magic Schools', e.message); }

            // Backgrounds
            count = 0;
            try {
                const backgrounds = await loader.loadBackgrounds();
                for (const bg of backgrounds) {
                     if (count >= limit) break;
                     console.log(`Generating Background: ${bg.name}`);
                     const request = backgroundMapper.map(bg);
                     const jsonSchema = await schemaBuilder.build(request.uid);
                     const result = await bridge.generateStructured(request.prompt, jsonSchema, { model: 'gemini-3-flash' });
                     if ((await dryRun.validate(result, request.uid)).valid) {
                         await saveEntity('background', bg.index, result);
                         console.log(`✅ Success: ${bg.name}`);
                     }
                     count++;
                }
            } catch (e: any) { console.log('Skipping Backgrounds', e.message); }

            // Weapon Properties
            count = 0;
            try {
                const weaponProperties = await loader.loadWeaponProperties();
                const weaponPropertyMapper = new (require('../../src/features/genesis-core/mappers/primitive-mappers').WeaponPropertyMapper)();
                
                for (const wp of weaponProperties) {
                     if (count >= limit) break;
                     console.log(`Generating Weapon Property: ${wp.name}`);
                     const request = weaponPropertyMapper.map(wp);
                     const jsonSchema = await schemaBuilder.build(request.uid);
                     const result = await bridge.generateStructured(request.prompt, jsonSchema, { model: 'gemini-3-flash' });
                     if ((await dryRun.validate(result, request.uid)).valid) {
                         await saveEntity('weapon-property', wp.index, result);
                         console.log(`✅ Success: ${wp.name}`);
                     }
                     count++;
                }
            } catch (e: any) { console.log('Skipping Weapon Properties', e.message); }



            // 1. Ingest Traits (Leaf)
            console.log('\n🍃 Ingesting Traits...');
            count = 0;
            try {
                const traits = await loader.loadTraits();
                for (const trait of traits) {
                     if (count >= limit) break;
                     console.log(`Generating Trait: ${trait.name}`);
                     const request = traitMapper.map(trait);
                     const jsonSchema = await schemaBuilder.build(request.uid);
                     const result = await bridge.generateStructured(request.prompt, jsonSchema, { model: 'gemini-3-flash' });
                     if ((await dryRun.validate(result, request.uid)).valid) {
                         await saveEntity('trait', trait.index, result);
                         console.log(`✅ Success: ${trait.name}`);
                     }
                     count++;
                }
            } catch (e: any) { console.log('Skipping Traits', e.message); }

             // 1.5 Ingest Features
            console.log('\n⚡ Ingesting Features...');
            count = 0;
            try {
                const features = await loader.loadFeatures();
                for (const feat of features) {
                     if (count >= limit) break;
                     console.log(`Generating Feature: ${feat.name}`);
                     const request = featureMapper.map(feat);
                     const jsonSchema = await schemaBuilder.build(request.uid);
                     const result = await bridge.generateStructured(request.prompt, jsonSchema, { model: 'gemini-3-flash' });
                     if ((await dryRun.validate(result, request.uid)).valid) {
                         await saveEntity('feature', feat.index, result);
                         console.log(`✅ Success: ${feat.name}`);
                     }
                     count++;
                }
            } catch (e: any) { console.log('Skipping Features', e.message); }
            
            // 2. Ingest Spells
            console.log('\n✨ Ingesting Spells...');
            const spells = await loader.loadSpells();
            count = 0;
            for (const spell of spells) {
                if (count >= limit) break;
                console.log(`\nGenerating Spell: ${spell.name} (${count + 1}/${limit})`);
                
                const request = spellMapper.map(spell);
                // Get Schema
                const jsonSchema = await schemaBuilder.build(request.uid);
                
                // Generate
                const result = await bridge.generateStructured(
                    request.prompt,
                    jsonSchema,
                    { model: 'gemini-3-flash' }
                );

                // Validate
                const validation = await dryRun.validate(result, request.uid);
                if (validation.valid) {
                    console.log(`✅ Success: ${spell.name}`);
                    await saveEntity('spell', spell.index, result);
                } else {
                    console.error(`❌ Validation Failed: ${spell.name}`, validation.errors);
                }
                count++;
            }

            // 3. Ingest Items
            console.log('\n🛡️ Ingesting Items...');
            const items = await loader.loadItems();
            count = 0;
            // Filter for simple items first?
            for (const item of items) {
                if (count >= limit) break;
                console.log(`\nGenerating Item: ${item.name} (${count + 1}/${limit})`);
                
                const request = itemMapper.map(item);
                const jsonSchema = await schemaBuilder.build(request.uid);
                
                const result = await bridge.generateStructured(
                    request.prompt,
                    jsonSchema,
                    { model: 'gemini-3-flash' }
                );

                const validation = await dryRun.validate(result, request.uid);
                if (validation.valid) {
                    console.log(`✅ Success: ${item.name}`);
                    await saveEntity('item', item.index, result);
                } else {
                    console.error(`❌ Validation Failed: ${item.name}`, validation.errors);
                }
                count++;
            }

            // 4. Ingest Classes
            console.log('\n🎓 Ingesting Classes...');
            try {
                const classes = await loader.loadClasses();
                const classMapper = new (require('../../src/features/genesis-core/mappers/class-mapper').ClassMapper)();
                
                count = 0;
                for (const cls of classes) {
                    if (count >= limit) break;
                    console.log(`\nGenerating Class: ${cls.name}`);
                    const request = classMapper.map(cls);
                    const jsonSchema = await schemaBuilder.build(request.uid);
                    const result = await bridge.generateStructured(request.prompt, jsonSchema, { model: 'gemini-3-flash' });
                    
                    const validation = await dryRun.validate(result, request.uid);
                    if (validation.valid) {
                         await saveEntity('class', cls.index, result);
                         console.log(`✅ Success: ${cls.name}`);
                    } else {
                        console.error(`❌ Validation Failed: ${cls.name}`, validation.errors);
                    }
                    count++;
                }
            } catch (e: any) { console.log('Skipping classes (loader mismatch or file missing)', e.message); }

            // 5. Ingest Races
            console.log('\n🧬 Ingesting Races...');
            try {
                // Re-declare races with let or a new name if it's a different set, or just use the existing 'races' if it's the same.
                // Assuming this is a fresh load for ingestion, so using 'let' to avoid redeclaration.
                let racesToIngest = await loader.loadRaces();
                const raceMapper = new (require('../../src/features/genesis-core/mappers/race-mapper').RaceMapper)();

                count = 0;
                for (const race of racesToIngest) {
                     if (count >= limit) break;
                     console.log(`\nGenerating Race: ${race.name}`);
                     const request = raceMapper.map(race);
                     const jsonSchema = await schemaBuilder.build(request.uid);
                     const result = await bridge.generateStructured(request.prompt, jsonSchema, { model: 'gemini-3-flash' });

                     const validation = await dryRun.validate(result, request.uid);
                     if (validation.valid) {
                          await saveEntity('race', race.index, result);
                          console.log(`✅ Success: ${race.name}`);
                     } else {
                        console.error(`❌ Validation Failed: ${race.name}`, validation.errors);
                     }
                     count++;
                }
            } catch (e: any) { console.log('Skipping races', e.message); }

            // 6. Ingest Monsters (Blueprints)
            console.log('\n👹 Ingesting Monsters (Blueprints)...');
            try {
                const monsters = await loader.loadMonsters();
                const monsterMapper = new (require('../../src/features/genesis-core/mappers/monster-mapper').MonsterMapper)();

                count = 0;
                const blueprints: any[] = [];

                for (const monster of monsters) {
                    if (count >= limit) break;
                    console.log(`\nGenerating Monster: ${monster.name}`);
                    const request = monsterMapper.map(monster);
                    
                    // Use custom blueprint schema
                    const jsonSchema = await schemaBuilder.build(monsterMapper.getSchemaIdentifier ? monsterMapper.getSchemaIdentifier() : request.uid);
                    
                    const result = await bridge.generateStructured(request.prompt, jsonSchema, { model: 'gemini-3-flash' });
                    
                    // Skip DryRun for blueprints as they don't match Strapi Schema directly yet
                    console.log(`✅ Generated Blueprint: ${monster.name}`);
                    blueprints.push(result);
                    count++;
                }

                // Save Batch
                if (blueprints.length > 0) {
                    const batchPath = path.resolve(process.cwd(), 'data/library/blueprints');
                    await fs.mkdir(batchPath, { recursive: true });
                    await fs.writeFile(path.join(batchPath, 'monsters-batch-gen.json'), JSON.stringify(blueprints, null, 2));
                    console.log(`\n💾 Saved ${blueprints.length} monster blueprints to data/library/blueprints/monsters-batch-gen.json`);
                }

            } catch (e: any) { console.log('Skipping monsters', e.message); }

            console.log('\n🏁 Ingestion Complete.');

        } catch (error) {
            console.error('Fatal Error:', error);
            process.exit(1);
        }
    });

async function saveEntity(type: string, index: string, data: any) {
    const dir = path.join(process.cwd(), 'seed-data', type);
    await fs.mkdir(dir, { recursive: true });
    const filename = path.join(dir, `${index}.json`);
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
}

program.parse(process.argv);
