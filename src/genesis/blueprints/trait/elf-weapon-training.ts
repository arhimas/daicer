import { defineTrait } from '@/features/genesis-core/blueprints';

export default defineTrait({
  slug: 'elf-weapon-training',
  name: 'Elf Weapon Training',
  compilation_state: {
    status: 'Valid',
    summary:
      'Successfully imported from SRD reference data. Trait provides specific weapon proficiencies common to elven subraces.',
  },
  description: 'You have proficiency with the longsword, shortsword, shortbow, and longbow.',
  embedding: {},
  proficiencies: ['longswords', 'shortswords', 'shortbows', 'longbows'],
  races: ['high-elf'],
});
