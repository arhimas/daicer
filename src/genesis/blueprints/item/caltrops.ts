import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'caltrops',
  name: 'Caltrops',
  description:
    "As an action, you can spread a bag of caltrops to cover a square area that is 5 feet on a side.\n\nAny creature that enters the area must succeed on a DC 15 Dexterity saving throw or stop moving this turn and take 1 piercing damage.\n\nTaking this damage reduces the creature's walking speed by 10 feet until the creature regains at least 1 hit point.\n\nA creature moving through the area at half speed doesn't need to make the save.",
  type: 'loot',
  rarity: 'common',
  value: 5,
  weight: 2,
  size: 'Medium',
  compilation_state: {
    status: 'Valid',
  },
});
