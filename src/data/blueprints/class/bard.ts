import { defineClass } from '@/features/genesis-core/blueprints';

export default defineClass({
  slug: 'bard',
  name: 'Bard',
  description:
    'Whether scholar, skald, or scoundrel, a bard weaves magic through words and music to inspire allies, demoralize foes, manipulate minds, create illusions, and even heal wounds.',
  lore: 'In the worlds of D&D, words and music are not just vibrations of air, but vocalizations with power all their own. The bard is a master of song, speech, and the magic they contain.',
  hit_die: 'd8',
  subclasses: ['lore'],
  proficiencies: [
    'light-armor',
    'simple-weapons',
    'longswords',
    'rapiers',
    'shortswords',
    'hand-crossbows',
    'saving-throw-dex',
    'saving-throw-cha',
  ],
  compilation_state: {
    status: 'Valid',
    hash: '8f3e2a1b',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Standard Bard class configuration',
  },
});
