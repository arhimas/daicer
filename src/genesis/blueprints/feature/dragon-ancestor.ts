import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'dragon-ancestor',
  name: 'Dragon Ancestor',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from SRD 5.1 reference.',
  },
  description:
    'At 1st level, you choose one type of dragon as your ancestor. The damage type associated with each dragon is used by features you gain later. You can speak, read, and write Draconic. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check.',
  level: 1,
  lore: 'Your innate magic comes from draconic magic that was mingled with your blood or that of your ancestors.',
  tags: ['sorcerer', 'draconic-bloodline'],
});
