import { defineTrait } from '@/features/genesis-core/blueprints';

export default defineTrait({
  slug: 'hellish-resistance',
  name: 'Hellish Resistance',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully imported from reference data.',
  },
  description: 'You have resistance to fire damage.',
  proficiencies: [],
  races: ['tiefling'],
});
