import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'thunderwave',
  name: 'Thunderwave',
  level: 1,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
    aoe_shape: 'Cube',
    aoe_size: 15,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Thunder',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Pushed 10 feet away from the caster',
      chance: 100,
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
    "A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a constitution saving throw. On a failed save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you. On a successful save, the creature takes half as much damage and isn't pushed. In addition, unsecured objects that are completely within the area of effect are automatically pushed 10 feet away from you by the spell's effect, and the spell emits a thunderous boom audible out to 300 feet. At Higher Levels: When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['bard', 'druid', 'sorcerer', 'wizard'],
});
