import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'superior-hunters-defense-stand-against-the-tide',
  name: "Superior Hunter's Defense: Stand Against the Tide",
  compilation_state: {
    status: 'Valid',
    summary: 'Feature extracted from 2014 Ranger Hunter subclass data.',
  },
  description:
    'When a hostile creature misses you with a melee attack, you can use your reaction to force that creature to repeat the same attack against another creature (other than itself) of your choice.',
  level: 15,
  tags: ['ranger', 'hunter'],
});
