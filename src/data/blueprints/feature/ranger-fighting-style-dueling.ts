import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'fighting-style-dueling',
  name: 'Fighting Style: Dueling',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from SRD data.',
  },
  description:
    'When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.',
  level: 2,
  tags: ['ranger', 'fighting-style'],
});
