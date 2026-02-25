import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'supreme-sneak',
  name: 'Supreme Sneak',
  compilation_state: {
    status: 'Valid',
    hash: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Compiled from standard 2014 SRD rogue thief feature.',
  },
  description:
    'Starting at 9th level, you have advantage on a Dexterity (Stealth) check if you move no more than half your speed on the same turn.',
  level: 9,
  lore: 'A master thief moves like a ghost, fading into the shadows the moment they slow their pace.',
  tags: ['rogue', 'thief'],
});
