import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'second-story-work',
  name: 'Second-Story Work',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'When you choose this archetype at 3rd level, you gain the ability to climb faster than normal; climbing no longer costs you extra movement. In addition, when you make a running jump, the distance you cover increases by a number of feet equal to your Dexterity modifier.',
  level: 3,
  lore: 'Thieves excel at infiltration, scaling walls and leaping across rooftops with ease.',
  tags: ['rogue', 'thief'],
});
