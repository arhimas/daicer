import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'dragon-ancestor-copper-acid-damage',
  name: 'Dragon Ancestor: Copper - Acid Damage',
  compilation_state: {
    status: 'Valid',
    summary: 'Feature extracted from reference data successfully.',
  },
  description:
    'At 1st level, you choose one type of dragon as your ancestor. The damage type associated with each dragon is used by features you gain later. You can speak, read, and write Draconic. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check. As a Copper dragon descendant, your associated damage type is Acid.',
  level: 1,
  tags: ['sorcerer', 'draconic-bloodline', 'dragon-ancestor'],
});
