import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'insect-plague',
  name: 'Insect Plague',
  level: 5,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A few grains of sugar, some kernels of grain, and a smear of fat.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 300,
  },
  duration_config: {
    type: 'Concentration',
    value: 10,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 4,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 4,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'End of Turn',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'The area of the spell is difficult terrain and lightly obscured.',
      chance: 100,
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Per Slot Level',
    dice_count: 1,
    dice_value: 10,
  },
  description:
    "Swarming, biting locusts fill a 20-foot-radius sphere centered on a point you choose within range. The sphere spreads around corners. The sphere remains for the duration, and its area is lightly obscured. The sphere's area is difficult terrain. When the area appears, each creature in it must make a constitution saving throw. A creature takes 4d10 piercing damage on a failed save, or half as much damage on a successful one. A creature must also make this saving throw when it enters the spell's area for the first time on a turn or ends its turn there. Higher Level: When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d10 for each slot level above 5th.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['cleric', 'druid', 'sorcerer', 'land'],
});
