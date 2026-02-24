import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'druid-circle',
  name: 'Druid Circle',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from SRD 5.1 reference data',
  },
  description:
    'At 2nd level, you choose to identify with a circle of druids, such as the Circle of the Land. Your choice grants you features at 2nd level and again at 6th, 10th, and 14th level.',
  level: 2,
  lore: 'The druidic circles represent ancient orders of nature-bound mystics who meet in secret groves to preserve the balance of the natural world.',
  tags: ['druid', 'class-feature'],
});
