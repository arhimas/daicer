import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Slam',
  description: 'Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 19 (3d8 + 6) bludgeoning damage.',
  type: 'melee',
  toHit: 10,
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
      damage_type: 'Bludgeoning',
      dice_count: 3,
      dice_value: 8,
      flat_bonus: 6,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'stone-golem-slam',
});
