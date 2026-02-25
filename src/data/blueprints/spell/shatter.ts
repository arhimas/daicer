import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'shatter',
  name: 'Shatter',
  level: 2,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A burst of mica.',
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
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Thunder',
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
  },
  description:
    'A sudden loud ringing noise, painfully intense, erupts from a point of your choice within range. Each creature in a 10-foot-radius sphere centered on that point must make a Constitution saving throw. A creature takes 3d8 thunder damage on a failed save, or half as much damage on a successful one. A creature made of inorganic material such as stone, crystal, or metal has disadvantage on this saving throw. A non-magical item that is not worn or carried also suffers damage if it is in the area of the spell. At Higher Levels: When you cast this spell using a 3rd level or higher spell slot, the damage of the spell increases by 1d8 for each level of higher spell slot above 2nd.',
  compilation_state: {
    status: 'Valid',
  },
});
