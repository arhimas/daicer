import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'dragon-ancestor-red-fire-damage',
  name: 'Dragon Ancestor: Red - Fire Damage',
  compilation_state: {
    status: 'Valid',
    summary: 'Generated from SRD 5.1 reference for Draconic Bloodline Sorcerer.',
  },
  description:
    'At 1st level, you choose one type of dragon as your ancestor. For the Red dragon ancestor, the associated damage type is Fire. This damage type is used by features you gain later. You can speak, read, and write Draconic. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check.',
  level: 1,
  lore: 'Your lineage traces back to a mighty red dragon, infusing your soul with the embers of ancient fire and the commanding presence of a true apex predator.',
  tags: ['sorcerer', 'draconic-bloodline', 'red-dragon'],
});
