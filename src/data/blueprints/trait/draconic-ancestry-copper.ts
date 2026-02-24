import { defineTrait } from '../../../features/genesis-core/blueprints';

export default defineTrait({
  slug: 'draconic-ancestry-copper',
  name: 'Draconic Ancestry (Copper)',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'You have draconic ancestry. As a copper dragonborn, your breath weapon deals Acid damage in a 5 by 30 ft. line. The saving throw for this breath weapon is Dexterity. You also gain resistance to Acid damage.',
  embedding: {},
  proficiencies: [],
  races: ['dragonborn'],
});
