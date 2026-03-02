import { defineBackground } from '@/features/genesis-core/blueprints';

export default defineBackground({
  slug: 'guild-artisan',
  name: 'Guild Artisan',
  compilation_state: {
    status: 'Valid',
    hash: '5eb6821d965e11e891220800200c9a66',
    last_run: '2023-10-27T12:00:00Z',
    summary: "Successfully compiled the Guild Artisan background from the Player's Handbook.",
  },
  description:
    "You are a member of a guild of artisans, skilled in a particular craft and closely associated with other artisans. You are a well-established part of the mercantile world, freed by talent and wealth from the constraints of a feudal social order. You learned your skills as an apprentice to a master, and now you have become a master in your own right, perhaps even with your own apprentice and a place in your guild's hierarchy. Your life is defined by your craft, whether you are a weaver, a smith, or a calligrapher.",
  equipment: [
    {
      isEquipped: false,
      item: 'artisan-tools',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'letter-of-introduction',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: true,
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
    name: 'Guild Membership',
    description:
      "As an established and respected member of a guild, you can rely on certain benefits that membership provides. Your fellow guild members will provide you with lodging and food if necessary, and pay for your funeral if needed. In some cities and towns, a guildhall offers a central place to meet other members of your profession, which can be a good place to meet potential patrons, allies, or hirelings. Guilds often wield tremendous political power. If you are accused of a crime, your guild will support you if a good case can be made for your innocence or if the crime is justifiable. You can also gain access to powerful political figures through the guild, if you are a member in good standing. Such connections might require the donation of money or magic items to the guild's coffers. You must pay dues of 5 gp per month to the guild. If you miss payments, you must make up back dues to remain in the guild's good graces.",
    source: 'other',
  },
  proficiencies: [
    {
      type: 'Skill',
      name: 'Insight',
      proficiency: 'skill-insight',
      value: 2,
    },
    {
      type: 'Skill',
      name: 'Persuasion',
      proficiency: 'skill-persuasion',
      value: 2,
    },
    {
      type: 'Tool',
      name: "Artisan's tools",
      proficiency: 'artisan-tools',
      value: 2,
    },
    {
      type: 'Language',
      name: 'One language of your choice',
      proficiency: 'language-any',
      value: 1,
    },
  ],
});
