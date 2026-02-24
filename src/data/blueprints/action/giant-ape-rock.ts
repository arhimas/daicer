import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Rock',
  description: 'Ranged Weapon Attack: +9 to hit, range 50/100 ft., one target. Hit: 30 (7d6 + 6) bludgeoning damage.',
  type: 'ranged',
  toHit: 9,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 50,
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
      dice_count: 7,
      dice_value: 6,
      flat_bonus: 6,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'giant-ape-rock',
});
