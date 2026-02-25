import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Claws',
  description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage.',
  type: 'melee',
  toHit: 4,
  range_config: {
    type: 'Touch',
    distance: 5,
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
      damage_type: 'Slashing',
      dice_count: 2,
      dice_value: 4,
      flat_bonus: 2,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ettercap-claws',
});
