import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tusks',
  description:
    'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage. If the target is a humanoid, it must succeed on a DC 12 Constitution saving throw or be cursed with wereboar lycanthropy.',
  type: 'melee',
  toHit: 5,
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
  save: {
    dc: 12,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Slashing',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Cursed with wereboar lycanthropy on a failed DC 12 Constitution save.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'wereboar-boar-tusks',
});
