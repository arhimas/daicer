import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'mass-cure-wounds',
  name: 'Mass Cure Wounds',
  level: 5,
  school: 'Conjuration',
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
    aoe_shape: 'Sphere',
    aoe_size: 30,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Auto-Hit',
  },
  damage_instances: [
    {
      effect_type: 'Healing',
      dice_count: 3,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Per Slot Level',
    dice_count: 1,
    dice_value: 8,
  },
  description:
    'A wave of healing energy washes out from a point of your choice within range. Choose up to six creatures in a 30-foot-radius sphere centered on that point. Each target regains hit points equal to 3d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs. At Higher Levels: When you cast this spell using a spell slot of 6th level or higher, the healing increases by 1d8 for each slot level above 5th.',
  compilation_state: {
    status: 'Valid',
  },
});
