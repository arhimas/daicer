import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'indomitable-might',
  name: 'Indomitable Might',
  compilation_state: {
    status: 'Valid',
    hash: '447e4498877e8992e54256860d8479e0',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Feature successfully generated from reference data.',
  },
  description:
    'Beginning at 18th level, if your total for a Strength check is less than your Strength score, you can use that score in place of the total.',
  embedding: {},
  image: '',
  level: 18,
  lore: 'Your physical prowess is so great that your raw strength becomes the baseline for any feat of power.',
  tags: ['barbarian', 'class-feature'],
});
