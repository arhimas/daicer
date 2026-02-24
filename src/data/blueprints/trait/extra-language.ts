import { defineTrait } from '../../../features/genesis-core/blueprints';

export default defineTrait({
  slug: 'extra-language',
  name: 'Extra Language',
  compilation_state: {
    status: 'Valid',
  },
  description: 'You can speak, read, and write one extra language of your choice.',
  proficiencies: [],
  races: ['high-elf'],
});
