import { defineTrait } from '@/features/genesis-core/blueprints';

export default defineTrait({
  slug: 'draconic-ancestry-red',
  name: 'Draconic Ancestry (Red)',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'You have draconic ancestry. Your breath weapon and damage resistance are determined by the dragon type. For a Red dragon, your damage type is Fire and your breath weapon is a 15-foot cone (Dexterity save).',
  embedding: {},
  proficiencies: [],
  races: ['dragonborn'],
});
