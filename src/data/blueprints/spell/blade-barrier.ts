import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'blade-barrier',
  name: 'Blade Barrier',
  level: 6,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 90,
  },
  duration_config: {
    type: 'Concentration',
    value: 10,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Slashing',
      dice_count: 6,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
  ],
  description:
    "You create a vertical wall of whirling, razor-sharp blades made of magical energy. The wall appears within range and lasts for the duration. You can make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in diameter, 20 feet high, and 5 feet thick. The wall provides three-quarters cover to creatures behind it, and its space is difficult terrain.\n\nWhen a creature enters the wall's area for the first time on a turn or starts its turn there, the creature must make a dexterity saving throw. On a failed save, the creature takes 6d10 slashing damage. On a successful save, the creature takes half as much damage.",
  compilation_state: {
    status: 'Valid',
  },
});
