import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Spellcasting',
  description:
    'The priest is a 5th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 13, +5 to hit with spell attacks). The priest has the following cleric spells prepared: Cantrips (at will): light, sacred flame, thaumaturgy; 1st level (4 slots): cure wounds, guiding bolt, sanctuary; 2nd level (3 slots): lesser restoration, spiritual weapon; 3rd level (2 slots): dispel magic, spirit guardians',
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'priest-spellcasting',
});
