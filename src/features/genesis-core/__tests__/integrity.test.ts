
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SchemaLoader } from '../schema-loader';
import { DryRunService } from '../dry-run-service';
import { GenesisManifest } from '../audit-service';

describe('Genesis Integrity', () => {
    const manifestPath = path.resolve(process.cwd(), 'genesis-manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
        it.skip('Manifest not found, skipping integrity tests', () => {});
        return;
    }

    const manifestData = fs.readFileSync(manifestPath, 'utf-8');
    const manifest: GenesisManifest = JSON.parse(manifestData);
    
    const loader = new SchemaLoader();
    const dryRun = new DryRunService(loader);

    const checkEntityCoverage = async (type: string, uid: string) => {
        const entities = manifest.entities.filter(e => e.type === type);
        const missing: string[] = [];
        const invalid: string[] = [];

        for (const entity of entities) {
            const filePath = path.resolve(process.cwd(), 'seed-data', type, `${entity.index}.json`);
            if (!fs.existsSync(filePath)) {
                missing.push(entity.name);
                continue;
            }

            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                // Validate against Strapi Schema
                // Note: We might need to map type -> UID if it differs (e.g. monster -> api::monster.monster)
                const validation = await dryRun.validate(content, uid);
                if (!validation.valid) {
                     invalid.push(`${entity.name}: ${validation.errors.join(', ')}`);
                }
            } catch (e) {
                invalid.push(`${entity.name}: Malformed JSON`);
            }
        }

        return { total: entities.length, missing, invalid };
    };

    describe('Spells Coverage', () => {
        it('should track spell generation progress', async () => {
            const { total, missing, invalid } = await checkEntityCoverage('spell', 'api::spell.spell');
            console.log(`Spells: ${total - missing.length}/${total} generated. Invalid: ${invalid.length}`);
            
            // Assertion: We expect at least the ones we generated manually to exist
            const acidArrowPath = path.resolve(process.cwd(), 'seed-data/spell/acid-arrow.json');
            expect(fs.existsSync(acidArrowPath)).toBe(true);
        });
    });

    describe('Items Coverage', () => {
        it('should track item generation progress', async () => {
            const { total, missing, invalid } = await checkEntityCoverage('item', 'api::item.item');
            console.log(`Items: ${total - missing.length}/${total} generated. Invalid: ${invalid.length}`);
            
             const clubPath = path.resolve(process.cwd(), 'seed-data/item/club.json');
             expect(fs.existsSync(clubPath)).toBe(true);
        });
    });

    describe('Features Coverage', () => {
        it('should track feature generation progress', async () => {
            const { total, missing, invalid } = await checkEntityCoverage('feature', 'api::feature.feature');
            console.log(`Features: ${total - missing.length}/${total} generated. Invalid: ${invalid.length}`);
        });
    });

    describe('Traits Coverage', () => {
         it('should track trait generation progress', async () => {
            const { total, missing, invalid } = await checkEntityCoverage('trait', 'api::trait.trait');
            console.log(`Traits: ${total - missing.length}/${total} generated. Invalid: ${invalid.length}`);
        });
    });

    describe('Monsters Coverage', () => {
         it('should track monster generation progress', async () => {
            const { total, missing, invalid } = await checkEntityCoverage('monster', 'api::monster.monster');
            console.log(`Monsters: ${total - missing.length}/${total} generated. Invalid: ${invalid.length}`);
        });
    });

    describe('Races Coverage', () => {
         it('should track race generation progress', async () => {
            const { total, missing, invalid } = await checkEntityCoverage('race', 'api::race.race');
            console.log(`Races: ${total - missing.length}/${total} generated. Invalid: ${invalid.length}`);
        });
    });

    describe('Classes Coverage', () => {
         it('should track class generation progress', async () => {
            const { total, missing, invalid } = await checkEntityCoverage('class', 'api::class.class');
            console.log(`Classes: ${total - missing.length}/${total} generated. Invalid: ${invalid.length}`);
        });
    });
});
