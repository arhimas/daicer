import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Rock',
  description: 'Ranged Weapon Attack: +5 to hit, range 25/50 ft., one target. Hit: 6 (1d6 + 3) bludgeoning damage.',
  type: 'ranged',
  toHit: 5,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 25,
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
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ape-rock',
});
