import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'timeless-body',
  name: 'Timeless Body',
  compilation_state: {
    status: 'Valid',
    hash: '7d8a9b2c',
    last_run: '2023-10-27',
    summary: 'Successfully compiled from reference data.',
  },
  description:
    "At 15th level, your ki sustains you so that you suffer none of the frailty of old age, and you can't be aged magically. You can still die of old age, however. In addition, you no longer need food or water.",
  level: 15,
  lore: "The flow of ki within a master monk's body becomes so refined that the passage of time loses its grip on their physical form.",
  tags: ['monk', 'class-feature'],
});
