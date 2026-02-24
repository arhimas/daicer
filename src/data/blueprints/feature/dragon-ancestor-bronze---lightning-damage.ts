import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'dragon-ancestor-bronze-lightning-damage',
  name: 'Dragon Ancestor: Bronze - Lightning Damage',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    'At 1st level, you choose one type of dragon as your ancestor. For a Bronze dragon ancestor, the damage type associated with it is Lightning. You can speak, read, and write Draconic. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check.',
  level: 1,
  tags: ['sorcerer', 'draconic-bloodline', 'bronze-dragon'],
});
