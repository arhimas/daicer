import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'bonus-cantrip',
  name: 'Bonus Cantrip',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully imported from reference data.',
  },
  description: 'When you choose this circle at 2nd level, you learn one additional druid cantrip of your choice.',
  level: 2,
  lore: "The Druid's connection to the land deepens, granting them a minor yet significant mastery over the elements and nature's whispers.",
  tags: ['druid', 'circle-of-the-land'],
});
