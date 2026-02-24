import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail',
  description:
    "Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage plus 7 (2d6) fire damage, and the target is grappled (escape DC 14). Until this grapple ends, the target is restrained, the salamander can automatically hit the target with its tail, and the salamander can't make tail attacks against other targets.",
  type: 'melee',
  toHit: 7,
  range_config: {
    type: 'Ranged (Feet)',
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
      dice_value: 6,
      flat_bonus: 4,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 14',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Restrained',
      description: 'Until this grapple ends',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'salamander-tail',
});
