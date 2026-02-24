import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Rock',
  description: 'Ranged Weapon Attack: +8 to hit, range 60/240 ft., one target. Hit: 21 (3d10 + 5) bludgeoning damage.',
  type: 'ranged',
  toHit: 8,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 3,
      dice_value: 10,
      flat_bonus: 5,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'hill-giant-rock',
});
