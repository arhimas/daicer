import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Charge',
  description:
    'If the centaur moves at least 30 ft. straight toward a target and then hits it with a pike attack on the same turn, the target takes an extra 10 (3d6) piercing damage.',
  type: 'ability',
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
  ],
  slug: 'centaur-charge',
});
