import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'defensive-tactics-escape-the-horde',
  name: 'Defensive Tactics: Escape the Horde',
  compilation_state: {
    status: 'Valid',
  },
  description: 'Opportunity attacks against you are made with disadvantage.',
  level: 7,
  tags: ['ranger', 'hunter'],
});
