import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'magical-secrets',
  name: 'Magical Secrets',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'By 10th level, you have plundered magical knowledge from a wide spectrum of disciplines. Choose two spells from any class, including this one. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip. The chosen spells count as bard spells for you and are included in the number in the Spells Known column of the Bard table. You learn two additional spells from any class at 14th level and again at 18th level.',
  level: 18,
  tags: ['bard'],
});
