import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Bites',
  description:
    "Melee Weapon Attack: +2 to hit, reach 0 ft., one target in the swarm's space. Hit: 7 (2d6) piercing damage, or 3 (1d6) piercing damage if the swarm has half of its hit points or fewer.",
  type: 'melee',
  toHit: 2,
  range_config: {
    type: 'Touch',
    distance: 0,
  },
  mechanics_config: {
    action_type: 'Melee Spell Attack',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  slug: 'swarm-of-rats-bites',
});
