import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail',
  description:
    'Melee Weapon Attack: +13 to hit, reach 15 ft., one target. Hit: 26 (3d12 + 7) bludgeoning damage. If the target is a creature, it must succeed on a DC 20 Strength saving throw or be pushed up to 10 feet away from the dragon turtle and knocked prone.',
  type: 'melee',
  toHit: 13,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 15,
  },
  mechanics_config: {
    action_type: 'None',
  },
  save: {
    dc: 20,
    attribute: 'str',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 3,
      dice_value: 12,
      flat_bonus: 7,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Prone',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'dragon-turtle-tail',
});
