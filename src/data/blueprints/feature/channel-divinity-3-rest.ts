import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'channel-divinity-3-rest',
  name: 'Channel Divinity (3/rest)',
  compilation_state: {
    status: 'Valid',
    hash: 'a7b2c9d4',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Compiled successfully from reference data.',
  },
  description:
    'Beginning at 6th level, you can use your Channel Divinity twice between rests, and beginning at 18th level, you can use it three times between rests. When you finish a short or long rest, you regain your expended uses.',
  embedding: {},
  image: '',
  level: 18,
  lore: "The cleric's connection to their deity strengthens, allowing them to channel divine energy more frequently.",
  tags: ['cleric'],
});
