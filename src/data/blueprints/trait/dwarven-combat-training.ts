import { defineTrait } from '@/features/genesis-core/blueprints';

export default defineTrait({
  slug: 'dwarven-combat-training',
  name: 'Dwarven Combat Training',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully imported from reference data.',
  },
  description: 'You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.',
  proficiencies: ['battleaxes', 'handaxes', 'light-hammers', 'warhammers'],
  races: ['dwarf'],
});
