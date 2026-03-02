import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'feral-instinct',
  name: 'Feral Instinct',
  compilation_state: {
    status: 'Valid',
    hash: 'e3b0c442',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    "By 7th level, your instincts are so honed that you have advantage on initiative rolls. Additionally, if you are surprised at the beginning of combat and aren't incapacitated, you can act normally on your first turn, but only if you enter your rage before doing anything else on that turn.",
  embedding: {},
  image: '',
  level: 7,
  lore: 'Your primal senses sharpen to a razor edge, allowing you to react to danger before your conscious mind even registers it.',
  tags: ['barbarian'],
});
