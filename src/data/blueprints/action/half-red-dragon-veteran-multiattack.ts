import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    'The veteran makes two longsword attacks. If it has a shortsword drawn, it can also make a shortsword attack.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'half-red-dragon-veteran-multiattack',
});
