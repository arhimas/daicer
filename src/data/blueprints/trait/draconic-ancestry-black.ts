import { defineTrait } from '../../../features/genesis-core/blueprints';

export default defineTrait({
  slug: 'draconic-ancestry-black',
  name: 'Draconic Ancestry (Black)',
  compilation_state: {
    status: 'Valid',
    summary: 'Standard racial trait for Black Dragonborn ancestry.',
  },
  description:
    'You have draconic ancestry. Your breath weapon and damage resistance are determined by the dragon type. As a Black dragonborn, your damage type is Acid and your Breath Weapon is a 5 by 30 ft. line (Dexterity save).',
  embedding: {},
  image: '',
  proficiencies: [],
  races: ['dragonborn'],
});
