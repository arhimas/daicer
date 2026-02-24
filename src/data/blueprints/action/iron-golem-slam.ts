import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Slam',
  description: 'Melee Weapon Attack: +13 to hit, reach 5 ft., one target. Hit: 20 (3d8 + 7) bludgeoning damage.',
  type: 'melee',
  toHit: 13,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 5,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 3,
      dice_value: 8,
      flat_bonus: 7,
      timing: 'Instant',
    },
  ],
  slug: 'iron-golem-slam',
});
