import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Pseudopod',
  description:
    'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) bludgeoning damage. If the mimic is in object form, the target is subjected to its Adhesive trait.',
  type: 'melee',
  toHit: 5,
  range_config: {
    type: 'Touch',
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  slug: 'mimic-pseudopod',
});
