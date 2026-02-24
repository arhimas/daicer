import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'druid-circle-feature',
  name: 'Druid Circle feature',
  compilation_state: {
    status: 'Valid',
    hash: '7d4e5f2a1c8b9d0e',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully generated based on SRD class progression data.',
  },
  description: 'At 14th level, you gain a feature granted by your Druid Circle choice.',
  embedding: {},
  image: '',
  level: 14,
  lore: "The ancient circles of druids gather in secret groves to share wisdom, each circle preserving distinct traditions and powers that define a druid's path.",
  tags: ['druid', 'class-feature'],
});
