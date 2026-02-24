import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Gore',
  description: 'Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 25 (4d8 + 7) piercing damage.',
  type: 'melee',
  toHit: 10,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 10,
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
      damage_type: 'Piercing',
      dice_count: 4,
      dice_value: 8,
      flat_bonus: 7,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'mammoth-gore',
});
