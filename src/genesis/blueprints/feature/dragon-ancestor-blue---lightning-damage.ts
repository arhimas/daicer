import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'dragon-ancestor-blue-lightning-damage',
  name: 'Dragon Ancestor: Blue - Lightning Damage',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'At 1st level, you choose one type of dragon as your ancestor. The damage type associated with each dragon is used by features you gain later. Your ancestor is a Blue dragon, which is associated with Lightning damage. You can speak, read, and write Draconic. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check.',
  level: 1,
});
