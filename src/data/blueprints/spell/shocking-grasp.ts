import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'shocking-grasp',
  name: 'Shocking Grasp',
  level: 0,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Melee Spell Attack',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Lightning',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: "The target can't take reactions until the start of its next turn.",
      chance: 100,
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Specific Thresholds',
    dice_count: 1,
    dice_value: 8,
  },
  description:
    "Lightning springs from your hand to deliver a shock to a creature you try to touch. Make a melee spell attack against the target. You have advantage on the attack roll if the target is wearing armor made of metal. On a hit, the target takes 1d8 lightning damage, and it can't take reactions until the start of its next turn.\n\nThe spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
  compilation_state: {
    status: 'Valid',
  },
});
