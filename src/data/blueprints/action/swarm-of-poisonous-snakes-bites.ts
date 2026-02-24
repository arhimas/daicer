import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Bites',
  description:
    "Melee Weapon Attack: +6 to hit, reach 0 ft., one creature in the swarm's space. Hit: 7 (2d6) piercing damage, or 3 (1d6) piercing damage if the swarm has half of its hit points or fewer. The target must make a DC 10 Constitution saving throw, taking 14 (4d6) poison damage on a failed save, or half as much damage on a successful one.",
  type: 'melee',
  toHit: 6,
  range_config: {
    type: 'Touch',
    distance: 0,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: {
    dc: 10,
    attribute: 'con',
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
    {
      effect_type: 'Damage',
      damage_type: 'Poison',
      dice_count: 4,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'swarm-of-poisonous-snakes-bites',
});
