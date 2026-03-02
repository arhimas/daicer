import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'sorcerous-restoration',
  name: 'Sorcerous Restoration',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully imported from SRD source.',
  },
  description: 'At 20th level, you regain 4 expended sorcery points whenever you finish a short rest.',
  level: 20,
  lore: 'The font of magic within you has become a self-sustaining spring, replenishing your innate power even with brief moments of respite.',
  tags: ['sorcerer'],
});
