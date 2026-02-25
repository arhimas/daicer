import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'roguish-archetype',
  name: 'Roguish Archetype',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'At 3rd level, you choose an archetype that you emulate in the exercise of your rogue abilities, such as Thief. Your archetype choice grants you features at 3rd level and then again at 9th, 13th, and 17th level.',
  level: 3,
  tags: ['rogue'],
});
