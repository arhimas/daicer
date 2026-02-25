import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'reverse-gravity',
  name: 'Reverse Gravity',
  level: 7,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      material: true,
      material_description: 'A lodestone and iron filings.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 100,
    aoe_shape: 'Cylinder',
    aoe_size: 50,
    aoe_height: 100,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Negate',
  },
  description:
    "This spell reverses gravity in a 50-foot-radius, 100-foot high cylinder centered on a point within range. All creatures and objects that aren't somehow anchored to the ground in the area fall upward and reach the top of the area when you cast this spell. A creature can make a dexterity saving throw to grab onto a fixed object it can reach, thus avoiding the fall.\n\nIf some solid object (such as a ceiling) is encountered in this fall, falling objects and creatures strike it just as they would during a normal downward fall. If an object or creature reaches the top of the area without striking anything, it remains there, oscillating slightly, for the duration.\n\nAt the end of the duration, affected objects and creatures fall back down.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['druid', 'sorcerer', 'wizard'],
});
