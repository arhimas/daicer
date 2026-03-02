import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'primal-champion',
  name: 'Primal Champion',
  compilation_state: {
    status: 'Valid',
    hash: 'a1b2c3d4e5f6',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped Primal Champion feature for Barbarian.',
  },
  description:
    'At 20th level, you embody the power of the wilds. Your Strength and Constitution scores increase by 4. Your maximum for those scores is now 24.',
  embedding: {},
  image: 'https://example.com/images/barbarian-capstone.png',
  level: 20,
  lore: 'You have reached the pinnacle of physical perfection, your very essence infused with the raw, untamed energy of the natural world.',
  tags: ['barbarian', 'class-feature', 'capstone'],
});
