import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'sacred-flame',
  name: 'Sacred Flame',
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
    type: 'Ranged (Feet)',
    distance: 60,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Negate',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Radiant',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
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
    "Flame-like radiance descends on a creature that you can see within range. The target must succeed on a dexterity saving throw or take 1d8 radiant damage. The target gains no benefit from cover for this saving throw.\n\nThe spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
  compilation_state: {
    status: 'Valid',
    summary: 'Sacred Flame cantrip successfully mapped from reference data.',
  },
  tags: ['cleric', 'lore'],
});
