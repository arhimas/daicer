import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Teleport',
  description:
    'The unicorn magically teleports itself and up to three willing creatures it can see within 5 ft. of it, along with any equipment they are wearing or carrying, to a location the unicorn is familiar with, up to 1 mile away.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Ranged (Miles)',
    distance: 1,
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
  slug: 'unicorn-teleport',
});
