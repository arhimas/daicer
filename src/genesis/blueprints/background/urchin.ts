import { defineBackground } from '@/features/genesis-core/blueprints';

export default defineBackground({
  slug: 'urchin',
  name: 'Urchin',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'You grew up on the streets alone, orphaned, and poor. You had no one to watch over you or to provide for you, so you learned to provide for yourself. You fought fiercely for every scrap of food and kept a constant watch out for other desperate souls who might steal from you. You slept on rooftops and in alleyways, exposed to the elements, and endured sickness without the advantage of medicine or a place to recuperate. You have survived despite all odds, and did so through cunning, strength, speed, or some combination of each.',
  equipment: [
    {
      isEquipped: false,
      item: 'item:dagger',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'item:map-of-city',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'item:pet-mouse',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'item:token-of-parents',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: true,
      item: 'item:common-clothes',
      quantity: 1,
      slot: 'armor',
    },
    {
      isEquipped: false,
      item: 'item:pouch',
      quantity: 1,
      slot: 'backpack',
    },
  ],
  feature: {
    name: 'City Secrets',
    description:
      'You know the secret patterns and flow to cities and can find passages through the urban sprawl that others would miss. When you are not in combat, you (and companions you lead) can travel between any two locations in the city twice as fast as your speed would normally allow.',
    source: 'other',
  },
  proficiencies: [
    {
      type: 'Skill',
      name: 'Sleight of Hand',
      proficiency: 'skill:sleight-of-hand',
    },
    {
      type: 'Skill',
      name: 'Stealth',
      proficiency: 'skill:stealth',
    },
    {
      type: 'Tool',
      name: 'Disguise kit',
      proficiency: 'tool:disguise-kit',
    },
    {
      type: 'Tool',
      name: "Thieves' tools",
      proficiency: 'tool:thieves-tools',
    },
  ],
});
