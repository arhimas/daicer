import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'step-of-the-wind',
  name: 'Step of the Wind',
  compilation_state: {
    status: 'Valid',
    hash: '8f3e2a1b',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Feature successfully mapped from reference data.',
  },
  description:
    'You can spend 1 ki point to take the Disengage or Dash action as a bonus action on your turn, and your jump distance is doubled for the turn.',
  embedding: {},
  image: 'https://example.com/assets/monk-step-of-the-wind.png',
  level: 2,
  lore: "A monk's agility is not merely physical, but a flow of ki that lightens the body and quickens the spirit, allowing them to move like a leaf on the breeze.",
  tags: ['monk', 'ki', 'mobility'],
});
