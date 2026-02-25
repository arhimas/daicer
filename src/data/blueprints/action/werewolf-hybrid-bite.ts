import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) piercing damage. If the target is a humanoid, it must succeed on a DC 12 Constitution saving throw or be cursed with werewolf lycanthropy.',
  type: 'melee',
  toHit: 4,
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
  save: {
    dc: 12,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 2,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Cursed with werewolf lycanthropy on a failed save',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'werewolf-hybrid-bite',
});
