import { defineClass } from '@/features/genesis-core/blueprints';

export default defineClass({
  slug: 'sorcerer',
  name: 'Sorcerer',
  description: 'An innate spellcaster who draws on a biological or lineage-based source of magic.',
  lore: "Sorcerers carry a magical birthright conferred upon them by an exotic bloodline, some otherworldly influence, or exposure to unknown cosmic forces. One can't study sorcery as one learns a language, any more than one can learn to live a legendary life. No one chooses sorcery; the power chooses the sorcerer.",
  hit_die: 'd6',
  subclasses: ['draconic'],
  proficiencies: [
    'daggers',
    'darts',
    'slings',
    'quarterstaffs',
    'crossbows-light',
    'saving-throw-con',
    'saving-throw-cha',
    'skill-arcana',
    'skill-deception',
    'skill-insight',
    'skill-intimidation',
    'skill-persuasion',
    'skill-religion',
  ],
  features: [
    {
      name: 'Spellcasting',
      description:
        'An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic.',
      source: 'class',
    },
    {
      name: 'Sorcerous Origin',
      description: 'Choose a sorcerous origin, which describes the source of your innate magical power.',
      source: 'class',
    },
    {
      name: 'Font of Magic',
      description: 'You can tap into the wellspring of magic within yourself to create various magical effects.',
      source: 'class',
      usage_max: 2,
      usage_per: 'long_rest',
    },
    {
      name: 'Metamagic',
      description: 'You gain the ability to twist your spells to suit your needs.',
      source: 'class',
    },
  ],
  progression: [
    {
      level: 1,
      class_specifics: {},
      features: ['spellcasting', 'sorcerous-origin'],
      spell_slots: {},
    },
    {
      level: 2,
      class_specifics: {},
      features: ['font-of-magic'],
      spell_slots: {},
    },
    {
      level: 3,
      class_specifics: {},
      features: ['metamagic'],
      spell_slots: {},
    },
  ],
  compilation_state: {
    status: 'Valid',
    summary: 'Imported from reference data',
  },
  embedding: {},
});
