import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail',
  description: 'Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 15 (3d6 + 5) bludgeoning damage.',
  type: 'melee',
  toHit: 9,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 10,
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
      dice_value: 6,
      flat_bonus: 5,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'aboleth-tail',
});
