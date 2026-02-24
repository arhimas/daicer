import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'vicious-mockery',
  name: 'Vicious Mockery',
  level: 0,
  school: 'Enchantment',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Psychic',
      dice_count: 1,
      dice_value: 4,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Disadvantage on the next attack roll it makes before the end of its next turn.',
      chance: 100,
      duration_rounds: 1,
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Specific Thresholds',
    dice_count: 1,
    dice_value: 4,
  },
  description:
    "You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you (though it need not understand you), it must succeed on a wisdom saving throw or take 1d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn. This spell's damage increases by 1d4 when you reach 5th level (2d4), 11th level (3d4), and 17th level (4d4).",
  compilation_state: {
    status: 'Valid',
  },
});
