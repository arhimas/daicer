import { defineClass } from '@/features/genesis-core/blueprints';

export default defineClass({
  slug: 'fighter',
  name: 'Fighter',
  description: 'A master of martial combat, skilled with a variety of weapons and armor.',
  lore: 'Fighters learn the basics of all combat styles. Every fighter can swing an axe, fence with a rapier, wield a longsword or a greatsword, use a bow, and even trap foes in a net with some degree of skill. Likewise, a fighter is adept with shields and every form of armor.',
  hit_die: 'd10',
  subclasses: ['champion'],
  proficiencies: ['all-armor', 'shields', 'simple-weapons', 'martial-weapons', 'saving-throw-str', 'saving-throw-con'],
  features: [
    {
      name: 'Fighting Style',
      description:
        'You adopt a particular style of fighting as your specialty. Choose one of the options available to the fighter class.',
      source: 'class',
    },
    {
      name: 'Second Wind',
      description:
        'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level.',
      source: 'class',
      usage_max: 1,
      usage_per: 'short_rest',
    },
  ],
  progression: [
    {
      level: 1,
      class_specifics: {},
      features: ['fighting-style', 'second-wind'],
      spell_slots: {},
    },
  ],
  compilation_state: {
    status: 'Valid',
    hash: '7a8b9c0d1e2f3g4h5i6j',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully imported from reference data.',
  },
  embedding: {},
  image: 'https://example.com/images/fighter.png',
});
