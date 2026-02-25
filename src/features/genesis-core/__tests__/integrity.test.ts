/* eslint-disable */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SchemaLoader } from '@/features/genesis-core/schema-loader';
import { DryRunService } from '@/features/genesis-core/dry-run-service';
import { GenesisManifest } from '@/features/genesis-core/audit-service';

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
    const entities = manifest.entities.filter((e) => e.type === type);
    const missing: string[] = [];
    const invalid: string[] = [];

    for (const entity of entities) {
      const filePath = path.resolve(process.cwd(), 'src/data/blueprints', type, `${entity.index}.ts`);
      if (!fs.existsSync(filePath)) {
        missing.push(entity.name);
        continue;
      }

      try {
        const mod = await import(filePath);
        const content = mod.default;
        // Validate against Strapi Schema
        // Note: We might need to map type -> UID if it differs (e.g. monster -> api::monster.monster)
        const validation = await dryRun.validate(content, uid);
        if (!validation.valid) {
          invalid.push(`${entity.name}: ${validation.errors.join(', ')}`);
        }
      } catch (e) {
        invalid.push(`${entity.name}: Failed to import or invalid TypeScript exported content`);
      }
    }

    return { total: entities.length, missing, invalid };
  };

  describe('Spells Coverage', () => {
    it('should track spell generation progress', async () => {
      const { total, missing, invalid } = await checkEntityCoverage('spell', 'api::spell.spell');
      console.log(`Spells: ${total - missing.length}/${total} generated. Invalid: ${invalid.length}`);
    });
  });

  describe('Items Coverage', () => {
    it('should track item generation progress', async () => {
      const { total, missing, invalid } = await checkEntityCoverage('item', 'api::item.item');
      console.log(`Items: ${total - missing.length}/${total} generated. Invalid: ${invalid.length}`);
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
