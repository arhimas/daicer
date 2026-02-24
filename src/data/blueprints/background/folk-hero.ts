import { defineBackground } from '../../../features/genesis-core/blueprints';

export default defineBackground({
  slug: 'folk-hero',
  name: 'Folk Hero',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'You come from a humble social rank, but you are destined for so much more. Already the people of your home village regard you as their champion, and your destiny calls you to stand against the tyrants and monsters that threaten the common folk everywhere.',
  equipment: [
    {
      isEquipped: false,
      item: 'artisan-tools',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'shovel',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'iron-pot',
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
  ],
  feature: {
    name: 'Rustic Hospitality',
    description:
      'Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners, unless you have shown yourself to be a danger to them. They will shield you from the law or anyone else searching for you, though they will not risk their lives for you.',
    source: 'other',
  },
  proficiencies: [
    {
      type: 'Skill',
      name: 'Animal Handling',
      proficiency: 'skill-animal-handling',
    },
    {
      type: 'Skill',
      name: 'Survival',
      proficiency: 'skill-survival',
    },
    {
      type: 'Tool',
      name: "Artisan's Tools",
      proficiency: 'artisan-tools',
    },
    {
      type: 'Tool',
      name: 'Vehicles (Land)',
      proficiency: 'vehicles-land',
    },
  ],
});
