import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'bard-college',
  name: 'Bard College',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'At 3rd level, you delve into the advanced techniques of a bard college of your choice, such as the College of Lore. Your choice grants you features at 3rd level and again at 6th and 14th level.',
  level: 3,
  tags: ['bard'],
});
