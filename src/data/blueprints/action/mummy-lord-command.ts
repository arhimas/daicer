import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Command',
  description: 'command',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 17,
    attribute: 'wis',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'mummy-lord-command',
});
