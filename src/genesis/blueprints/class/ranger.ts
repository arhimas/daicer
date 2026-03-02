import { defineClass } from '@/features/genesis-core/blueprints';

export default defineClass({
  slug: 'ranger',
  name: 'Ranger',
  description:
    'A warrior who uses martial prowess and nature magic to combat threats on the edges of civilization, the ranger is a master of the wilderness.',
  lore: 'Rangers are masters of the wild, acting as scouts, trackers, and protectors of the borderlands. They often work alone or in small groups to hunt down threats that others cannot even find.',
  hit_die: 'd10',
  subclasses: ['hunter'],
  proficiencies: [
    'light-armor',
    'medium-armor',
    'shields',
    'simple-weapons',
    'martial-weapons',
    'saving-throw-dex',
    'saving-throw-str',
    'skill-animal-handling',
    'skill-athletics',
    'skill-insight',
    'skill-investigation',
    'skill-nature',
    'skill-perception',
    'skill-stealth',
    'skill-survival',
  ],
  features: [
    {
      name: 'Favored Enemy',
      description:
        'Beginning at 1st level, you have significant experience studying, tracking, hunting, and even talking to a certain type of enemy.',
      source: 'class',
    },
    {
      name: 'Natural Explorer',
      description:
        'You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions.',
      source: 'class',
    },
  ],
  progression: [
    {
      level: 1,
      features: ['favored-enemy', 'natural-explorer'],
    },
    {
      level: 2,
      features: ['fighting-style', 'spellcasting'],
    },
    {
      level: 3,
      features: ['ranger-archetype', 'primeval-awareness'],
    },
  ],
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from SRD reference data.',
  },
  embedding: {},
});
