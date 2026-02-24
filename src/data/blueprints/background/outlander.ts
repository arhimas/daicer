import { defineBackground } from '../../../features/genesis-core/blueprints';

export default defineBackground({
  slug: 'outlander',
  name: 'Outlander',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "You grew up in the wilds, far from civilization and the comforts of town and technology. You've witnessed the migration of herds larger than forests, survived weather more terrible than any city-dweller can comprehend, and enjoyed the solitude of being the only thinking creature for miles in any direction. The wilds are in your blood, whether you were a nomad, an explorer, a recluse, a hunter-gatherer, or even a marauder. Even in places where you don't know the specific features of the terrain, you know the ways of the wild.",
  equipment: [
    {
      isEquipped: false,
      item: 'staff',
      quantity: 1,
      slot: 'main_hand',
    },
    {
      isEquipped: false,
      item: 'hunting-trap',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'animal-trophy',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'travelers-clothes',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'pouch',
      quantity: 1,
      slot: 'backpack',
    },
  ],
  feature: {
    name: 'Wanderer',
    description:
      'You have an excellent memory for maps and geography, and you can always recall the general layout of terrain, settlements, and other features around you. In addition, you can find food and fresh water for yourself and up to five other people each day, provided that the land offers berries, small game, water, and so forth.',
    source: 'other',
  },
  proficiencies: [
    {
      type: 'Skill',
      name: 'Athletics',
      proficiency: 'skill-athletics',
    },
    {
      type: 'Skill',
      name: 'Survival',
      proficiency: 'skill-survival',
    },
    {
      type: 'Tool',
      name: 'Musical Instrument',
      proficiency: 'tool-musical-instrument',
    },
    {
      type: 'Language',
      name: 'Language',
      proficiency: 'lang-any',
    },
  ],
});
