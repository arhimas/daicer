import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'dragon-ancestor-white-cold-damage',
  name: 'Dragon Ancestor: White - Cold Damage',
  compilation_state: {
    status: 'Valid',
    hash: '6e7f8a9b',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from SRD reference data.',
  },
  description:
    'At 1st level, you choose one type of dragon as your ancestor. Your ancestor is the White Dragon, which is associated with Cold damage. The damage type associated with each dragon is used by features you gain later. You can speak, read, and write Draconic. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check.',
  embedding: {},
  image: '',
  level: 1,
  lore: "The primal chill of the glacier flows through your veins, a legacy of the white dragon's frozen domain.",
  tags: ['sorcerer', 'draconic-bloodline', 'class-feature'],
});
