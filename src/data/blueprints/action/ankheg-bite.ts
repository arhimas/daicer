import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage plus 3 (1d6) acid damage. If the target is a Large or smaller creature, it is grappled (escape DC 13). Until this grapple ends, the ankheg can bite only the grappled creature and has advantage on attack rolls to do so.',
  type: 'melee',
  toHit: 5,
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
      damage_type: 'Slashing',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 3,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Acid',
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 13',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'ankheg-bite',
});
