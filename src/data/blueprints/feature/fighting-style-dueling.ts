import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'fighting-style-dueling',
  name: 'Fighting Style: Dueling',
  compilation_state: {
    status: 'Valid',
    hash: 'f8e9d2a1',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Feature successfully generated from reference data.',
  },
  description:
    'When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.',
  embedding: {},
  level: 2,
  lore: 'A duelist focuses on the precision of a single blade, ensuring every strike counts.',
  tags: ['paladin', 'fighting-style'],
});
