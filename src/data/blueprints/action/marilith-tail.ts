import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail',
  description:
    "Melee Weapon Attack: +9 to hit, reach 10 ft., one creature. Hit: 15 (2d10 + 4) bludgeoning damage. If the target is Medium or smaller, it is grappled (escape DC 19). Until this grapple ends, the target is restrained, the marilith can automatically hit the target with its tail, and the marilith can't make tail attacks against other targets.",
  type: 'melee',
  toHit: 9,
  range_config: {
    type: 'Touch',
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
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 10,
      flat_bonus: 4,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 19',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Restrained',
      description: null,
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'marilith-tail',
});
