import { defineBackground } from '../../../features/genesis-core/blueprints';

export default defineBackground({
  slug: 'criminal',
  name: 'Criminal',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'You are an experienced criminal with a history of breaking the law. You have spent a lot of time among other criminals and still have contacts within the criminal underworld. You are far closer than most people to the world of murder, theft, and violence that pervades the underbelly of civilization, and you have survived up to this point by flouting the rules and regulations of society.',
  equipment: [
    {
      isEquipped: false,
      item: 'crowbar',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: true,
      item: 'clothes-common-dark',
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
    name: 'Criminal Contact',
    description:
      'You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals. You know how to get messages to and from your contact, even over great distances; specifically, you know the local messengers, corrupt caravan masters, and seedy sailors who can deliver messages for you.',
    source: 'other',
  },
  proficiencies: [
    {
      type: 'Skill',
      name: 'Deception',
      proficiency: 'skill-deception',
    },
    {
      type: 'Skill',
      name: 'Stealth',
      proficiency: 'skill-stealth',
    },
    {
      type: 'Tool',
      name: "Thieves' tools",
      proficiency: 'thieves-tools',
    },
    {
      type: 'Tool',
      name: 'Gaming set',
      proficiency: 'dice-set',
    },
  ],
});
