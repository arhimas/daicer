import { defineTrait } from '../../../features/genesis-core/blueprints';

export default defineTrait({
  slug: 'draconic-ancestry-blue',
  name: 'Draconic Ancestry (Blue)',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully imported from reference data.',
  },
  description:
    'You have draconic ancestry. For the Blue dragon type, your damage type is Lightning. Your breath weapon consists of a 5 by 30 ft. line, requiring a Dexterity saving throw. You also gain resistance to lightning damage.',
  embedding: {},
  proficiencies: [],
  races: ['dragonborn'],
});
