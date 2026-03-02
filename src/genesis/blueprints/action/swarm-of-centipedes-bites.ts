import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bites',
  description:
    "Melee Weapon Attack: +3 to hit, reach 0 ft., one target in the swarm's space. Hit: 10 (4d4) piercing damage, or 5 (2d4) piercing damage if the swarm has half of its hit points or fewer. A creature reduced to 0 hit points by a swarm of centipedes is stable but poisoned for 1 hour, even after regaining hit points, and paralyzed while poisoned in this way.",
  type: 'melee',
  toHit: 3,
  range_config: {
    type: 'Touch',
    distance: null,
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
      dice_value: 4,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Poisoned',
      description: 'for 1 hour, even after regaining hit points, if reduced to 0 hit points by this attack',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Paralyzed',
      description: 'while poisoned in this way, if reduced to 0 hit points by this attack',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'swarm-of-centipedes-bites',
});
