import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Beak',
  description: 'Melee Weapon Attack: +13 to hit, reach 10 ft., one target. Hit: 27 (4d8 + 9) piercing damage.',
  type: 'melee',
  toHit: 13,
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
      dice_value: 8,
      flat_bonus: 9,
      timing: 'Instant',
    },
  ],
  slug: 'roc-beak',
});
