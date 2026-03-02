import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'beast-spells',
  name: 'Beast Spells',
  compilation_state: {
    status: 'Valid',
    hash: '66f1e2a3',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from SRD data.',
  },
  description:
    "Beginning at 18th level, you can cast many of your druid spells in any shape you assume using Wild Shape. You can perform the somatic and verbal components of a druid spell while in a beast shape, but you aren't able to provide material components.",
  level: 18,
  tags: ['druid'],
});
