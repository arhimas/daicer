import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'faerie-fire',
  name: 'Faerie Fire',
  level: 1,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
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
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Negate',
  },
  condition_instances: [
    {
      condition: 'Special',
      description:
        'Affected creatures and objects shed dim light in a 10-foot radius, grant advantage on attack rolls against them, and cannot benefit from being invisible.',
      chance: 100,
    },
  ],
  description:
    "Each object in a 20-foot cube within range is outlined in blue, green, or violet light (your choice). Any creature in the area when the spell is cast is also outlined in light if it fails a dexterity saving throw. For the duration, objects and affected creatures shed dim light in a 10-foot radius.\\n\\nAny attack roll against an affected creature or object has advantage if the attacker can see it, and the affected creature or object can't benefit from being invisible.",
  compilation_state: {
    status: 'Valid',
  },
});
