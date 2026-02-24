import { defineBackground } from '../../../features/genesis-core/blueprints';

export default defineBackground({
  slug: 'acolyte',
  name: 'Acolyte',
  compilation_state: {
    status: 'Valid',
    hash: '7d4a1b2c3e4f5g6h',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Acolyte background generated from PHB sources.',
  },
  description:
    'You have spent your life in the service of a temple to a specific god or pantheon of gods. You act as an intermediary between the realm of the holy and the mortal world, performing sacred rites and offering sacrifices in order to conduct worshipers into the presence of the divine. You are not necessarily a cleric—performing sacred rites is not the same thing as channeling divine power. You might be a lowly functionary in a temple, raised from childhood to assist the priests in the sacred rites, or a high priest who experienced a call to serve your god in a different way.',
  equipment: [
    {
      isEquipped: false,
      item: 'holy-symbol',
      quantity: 1,
      slot: 'accessory',
    },
    {
      isEquipped: false,
      item: 'prayer-book',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'incense',
      quantity: 5,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'vestments',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: true,
      item: 'common-clothes',
      quantity: 1,
      slot: 'armor',
    },
    {
      isEquipped: false,
      item: 'pouch',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'gold-piece',
      quantity: 15,
      slot: 'backpack',
    },
  ],
  feature: {
    name: 'Shelter of the Faithful',
    description:
      'As an acolyte, you command the respect of those who share your faith, and you can perform the religious ceremonies of your deity. You and your adventuring companions can expect to receive free healing and care at a temple, shrine, or other established presence of your faith, though you must provide any material components needed for spells. Those who share your religion will support you (but only you) at a modest lifestyle. You might also have ties to a specific temple dedicated to your chosen deity or pantheon, and you have a residence there. While near your temple, you can call upon the priests for assistance, provided the assistance you ask for is not hazardous and you remain in good standing with your temple.',
    source: 'other',
  },
  proficiencies: [
    {
      type: 'Skill',
      name: 'Insight',
      proficiency: 'skill-insight',
    },
    {
      type: 'Skill',
      name: 'Religion',
      proficiency: 'skill-religion',
    },
    {
      type: 'Language',
      name: 'Language (Two of your choice)',
      proficiency: undefined,
    },
  ],
});
