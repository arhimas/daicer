import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'dragon-ancestor-gold-fire-damage',
  name: 'Dragon Ancestor: Gold - Fire Damage',
  compilation_state: {
    status: 'Valid',
    hash: 'a1b2c3d4e5f6',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Successfully mapped from 2014 SRD reference.',
  },
  description:
    'At 1st level, you choose one type of dragon as your ancestor. For the Gold dragon, your associated damage type is Fire. You can speak, read, and write Draconic. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check.',
  embedding: {},
  level: 1,
  lore: 'The blood of a golden dragon flows through your veins, marking your soul with the essence of fire and the wisdom of the most noble wyrms.',
  tags: ['sorcerer', 'draconic-bloodline'],
});
