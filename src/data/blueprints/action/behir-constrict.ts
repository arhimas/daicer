import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Constrict',
  description:
    "Melee Weapon Attack: +10 to hit, reach 5 ft., one Large or smaller creature. Hit: 17 (2d10 + 6) bludgeoning damage plus 17 (2d10 + 6) slashing damage. The target is grappled (escape DC 16) if the behir isn't already constricting a creature, and the target is restrained until this grapple ends.",
  type: 'melee',
  toHit: 10,
  range_config: {
    type: 'Ranged (Feet)',
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
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 10,
      flat_bonus: 6,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Slashing',
      dice_count: 2,
      dice_value: 10,
      flat_bonus: 6,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 16',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Restrained',
      description: 'until this grapple ends',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'behir-constrict',
});
