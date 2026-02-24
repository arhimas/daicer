import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail',
  description: 'Melee Weapon Attack: +17 to hit, reach 20 ft., one target. Hit: 19 (2d8 + 10) bludgeoning damage.',
  type: 'melee',
  toHit: 17,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 20,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 10,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ancient-gold-dragon-tail',
});
