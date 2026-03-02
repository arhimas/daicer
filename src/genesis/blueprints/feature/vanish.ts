import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'vanish',
  name: 'Vanish',
  compilation_state: {
    status: 'Valid',
    hash: '4e8f1a2b3c4d5e6f7g8h9i0j',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from SRD data.',
  },
  description:
    "Starting at 14th level, you can use the Hide action as a bonus action on your turn. Also, you can't be tracked by nonmagical means, unless you choose to leave a trail.",
  level: 14,
  lore: 'The ranger becomes a ghost of the wild, slipping into the shadows with effortless grace and leaving no footprint behind.',
  tags: ['ranger', 'class-feature'],
});
