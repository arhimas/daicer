import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Teleport',
  description:
    'The sphinx magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'androsphinx-teleport',
});
