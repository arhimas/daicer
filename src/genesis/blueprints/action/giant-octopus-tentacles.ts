import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Tentacles',
  description:
    "Melee Weapon Attack: +5 to hit, reach 15 ft., one target. Hit: 10 (2d6 + 3) bludgeoning damage. If the target is a creature, it is grappled (escape DC 16). Until this grapple ends, the target is restrained, and the octopus can't use its tentacles on another target.",
  type: 'melee',
  toHit: 5,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 15,
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
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 16',
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
  slug: 'giant-octopus-tentacles',
});
