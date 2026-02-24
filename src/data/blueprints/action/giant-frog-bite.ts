import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) piercing damage, and the target is grappled (escape DC 11). Until this grapple ends, the target is restrained, and the frog can't bite another target.",
  type: 'melee',
  toHit: 3,
  range_config: {
    type: 'Touch',
    distance: 5,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: null,
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 1,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 11',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Restrained',
      description: 'Until this grapple ends',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'giant-frog-bite',
});
