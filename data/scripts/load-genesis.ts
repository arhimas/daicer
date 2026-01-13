import { createStrapi } from '@strapi/strapi';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  DamageTypeLoader,
  MagicSchoolLoader,
  WeaponPropertyLoader,
  EquipmentCategoryLoader,
  ProficiencyLoader,
  LanguageLoader,
} from './loaders/atom-loaders';
import { SpellLoader } from './loaders/molecule-loaders';

// Load env before Strapi
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  console.log('ðŸŒŒ Initializing Genesis Engine...');

  // We should ideally use the same config logic as probe-schema if running from backend
  const strapi = await createStrapi({ distDir: 'dist' }).load();

  try {
    // --- Phase 1: Atoms ---
    console.log('\n--- Phase 1: Atoms (The Foundation) ---');
    await new DamageTypeLoader(strapi, 'atoms/damage-types.json').load();
    await new MagicSchoolLoader(strapi, 'atoms/magic-schools.json').load();
    await new WeaponPropertyLoader(strapi, 'atoms/weapon-properties.json').load();
    await new EquipmentCategoryLoader(strapi, 'atoms/equipment-categories.json').load();
    await new ProficiencyLoader(strapi, 'atoms/proficiencies.json').load();
    await new LanguageLoader(strapi, 'atoms/languages.json').load();

    // --- Phase 2: Molecules ---
    console.log('\n--- Phase 2: Molecules (The Magic) ---');
    // Note: features.json doesn't exist yet, so it will warn but not fail
    // await new FeatureLoader(strapi, 'molecules/features.json').load();
    await new SpellLoader(strapi, 'molecules/spells.json').load();

    console.log('\nâœ… Genesis Complete. All systems operational.');
  } catch (error) {
    console.error('ðŸ’¥ Genesis Failed:', error);
  } finally {
    strapi.stop();
    // Force exit because Strapi db connection sometimes hangs
    process.exit(0);
  }
}

main();
