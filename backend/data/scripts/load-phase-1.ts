import { createStrapi } from '@strapi/strapi';
import {
  DamageTypeLoader,
  MagicSchoolLoader,
  WeaponPropertyLoader,
  EquipmentCategoryLoader,
  ProficiencyLoader,
  LanguageLoader,
} from './loaders/atom-loaders';

async function main() {
  const strapi = await createStrapi({ distDir: 'dist' }).load();

  try {
    console.log('ðŸ§¬ Starting Genesis Phase 1: Atoms...');

    await new DamageTypeLoader(strapi, 'atoms/damage-types.json').load();
    await new MagicSchoolLoader(strapi, 'atoms/magic-schools.json').load();
    await new WeaponPropertyLoader(strapi, 'atoms/weapon-properties.json').load();
    await new EquipmentCategoryLoader(strapi, 'atoms/equipment-categories.json').load();
    await new ProficiencyLoader(strapi, 'atoms/proficiencies.json').load();
    await new LanguageLoader(strapi, 'atoms/languages.json').load();

    console.log('âœ… Phase 1 Complete.');
  } catch (error) {
    console.error('Genesis Failed:', error);
  } finally {
    strapi.stop();
  }
}

main();
