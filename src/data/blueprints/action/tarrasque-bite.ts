import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    "Melee Weapon Attack: +19 to hit, reach 10 ft., one target. Hit: 36 (4d12 + 10) piercing damage. If the target is a creature, it is grappled (escape DC 20). Until this grapple ends, the target is restrained, and the tarrasque can't bite another target.",
  type: 'melee',
  toHit: 19,
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
      flat_bonus: 10,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 20',
      chance: 100,
    },
    {
      condition: 'Restrained',
      description: 'Until this grapple ends',
      chance: 100,
    },
  ],
  slug: 'tarrasque-bite',
});
