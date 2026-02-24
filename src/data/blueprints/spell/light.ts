import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'light',
  name: 'Light',
  level: 0,
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
      material_description: 'A firefly or phosphorescent moss.',
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 1,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Negate',
  },
  description:
    'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored as you like. Completely covering the object with something opaque blocks the light. The spell ends if you cast it again or dismiss it as an action. If you target an object held or worn by a hostile creature, that creature must succeed on a dexterity saving throw to avoid the spell.',
  compilation_state: {
    status: 'Valid',
  },
});
