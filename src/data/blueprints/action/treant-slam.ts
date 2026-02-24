import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Slam',
  description: 'Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 16 (3d6 + 6) bludgeoning damage.',
  type: 'melee',
  toHit: 10,
  range_config: {
    type: 'Touch',
    distance: 5,
  },
  mechanics_config: {
    action_type: 'Melee Spell Attack',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 6,
      timing: 'Instant',
    },
  ],
  slug: 'treant-slam',
});
