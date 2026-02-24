import { defineClass } from '../../../features/genesis-core/blueprints';

export default defineClass({
  slug: 'warlock',
  name: 'Warlock',
  description: 'A wielder of magic that is derived from a bargain with an extraplanar entity.',
  lore: 'Warlocks are seekers after the knowledge that lies hidden in the fabric of the multiverse. Through pacts made with mysterious beings of supernatural power, warlocks unlock magical effects both subtle and spectacular.',
  hit_die: 'd8',
  subclasses: ['fiend'],
  proficiencies: ['light-armor', 'simple-weapons', 'saving-throw-wis', 'saving-throw-cha'],
  features: [
    {
      name: 'Otherworldly Patron',
      description: 'At 1st level, you have struck a bargain with an otherworldly being of your choice.',
      source: 'class',
    },
    {
      name: 'Pact Magic',
      description:
        'Your arcane research and the magic bestowed on you by your patron have given you facility with spells.',
      source: 'class',
    },
    {
      name: 'Eldritch Invocations',
      description:
        'In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability.',
      source: 'class',
    },
  ],
  progression: [
    {
      level: 1,
      class_specifics: {},
      features: ['otherworldly-patron', 'pact-magic'],
      spell_slots: {},
    },
    {
      level: 2,
      class_specifics: {},
      features: ['eldritch-invocations'],
      spell_slots: {},
    },
  ],
  compilation_state: {
    status: 'Valid',
    summary: 'Imported from reference SRD data',
  },
  embedding: {},
  image: '',
});
