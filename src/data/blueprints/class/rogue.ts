import { defineClass } from '../../../features/genesis-core/blueprints';

export default defineClass({
  slug: 'rogue',
  name: 'Rogue',
  description: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies.',
  hit_die: 'd8',
  subclasses: ['thief'],
  proficiencies: [
    'light-armor',
    'simple-weapons',
    'longswords',
    'rapiers',
    'shortswords',
    'hand-crossbows',
    'thieves-tools',
    'saving-throw-dex',
    'saving-throw-int',
  ],
  compilation_state: {
    status: 'Valid',
    summary: 'Imported from SRD reference data.',
  },
});
