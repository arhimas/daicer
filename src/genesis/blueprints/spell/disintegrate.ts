import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'disintegrate',
  name: 'Disintegrate',
  level: 6,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A lodestone and a pinch of dust.',
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
      damage_type: 'Force',
      dice_count: 10,
      dice_value: 6,
      flat_bonus: 40,
      timing: 'Instant',
    },
  ],
  condition_instances: [],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Per Slot Level',
    dice_count: 3,
    dice_value: 6,
  },
  description:
    'A thin green ray springs from your pointing finger to a target that you can see within range. The target can be a creature, an object, or a creation of magical force, such as the wall created by wall of force. A creature targeted by this spell must make a dexterity saving throw. On a failed save, the target takes 10d6 + 40 force damage. If this damage reduces the target to 0 hit points, it is disintegrated. A disintegrated creature and everything it is wearing and carrying, except magic items, are reduced to a pile of fine gray dust. The creature can be restored to life only by means of a true resurrection or a wish spell. This spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force. If the target is a Huge or larger object or creation of force, this spell disintegrates a 10-foot-cube portion of it. A magic item is unaffected by this spell. Higher Level: When you cast this spell using a spell slot of 7th level or higher, the damage increases by 3d6 for each slot level above 6th.',
  compilation_state: {
    status: 'Valid',
  },
  tags: ['sorcerer', 'wizard'],
});
