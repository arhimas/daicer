import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'roguish-archetype-feature',
  name: 'Roguish Archetype feature',
  compilation_state: {
    status: 'Valid',
    summary: 'Feature mapped from level 9 rogue progression.',
  },
  description:
    'At 9th level, you gain a feature granted by your Roguish Archetype choice. Your archetype choice grants you features at 3rd level and then again at 9th, 13th, and 17th level.',
  level: 9,
  lore: 'The specialization of a rogue marks their transition from a common thief to a master of a specific craft.',
  tags: ['rogue'],
});
