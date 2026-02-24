import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Guiding Bolt',
  description: 'guiding bolt',
  type: 'spell',
  toHit: 9,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Ranged Spell Attack',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'mummy-lord-guiding-bolt',
});
