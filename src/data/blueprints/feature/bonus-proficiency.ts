import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'bonus-proficiency',
  name: 'Bonus Proficiency',
  compilation_state: {
    status: 'Valid',
  },
  description: 'When you choose this domain at 1st level, you gain proficiency with heavy armor.',
  level: 1,
  tags: ['cleric', 'life-domain'],
});
