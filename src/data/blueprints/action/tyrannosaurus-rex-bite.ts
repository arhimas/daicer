import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 33 (4d12 + 7) piercing damage. If the target is a Medium or smaller creature, it is grappled (escape DC 17). Until this grapple ends, the target is restrained, and the tyrannosaurus can't bite another target.",
  type: 'melee',
  toHit: 10,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 10,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 4,
      dice_value: 12,
      flat_bonus: 7,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 17',
      chance: 100,
    },
    {
      condition: 'Restrained',
      description: 'Until this grapple ends',
      chance: 100,
    },
  ],
  slug: 'tyrannosaurus-rex-bite',
});
