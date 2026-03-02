import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Smother',
  description:
    "Melee Weapon Attack: +5 to hit, reach 5 ft., one Medium or smaller creature. Hit: The creature is grappled (escape DC 13). Until this grapple ends, the target is restrained, blinded, and at risk of suffocating, and the rug can't smother another target. In addition, at the start of each of the target's turns, the target takes 10 (2d6 + 3) bludgeoning damage.",
  type: 'melee',
  toHit: 5,
  range_config: {
    type: 'Touch',
    distance: 5,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 3,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'Escape DC 13',
      chance: 100,
    },
    {
      condition: 'Restrained',
      description: 'Until grapple ends',
      chance: 100,
    },
    {
      condition: 'Blinded',
      description: 'Until grapple ends',
      chance: 100,
    },
    {
      condition: 'Special',
      description: 'At risk of suffocating',
      chance: 100,
    },
  ],
  slug: 'rug-of-smothering-smother',
});
