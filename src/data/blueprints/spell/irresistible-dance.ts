import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'irresistible-dance',
  name: 'Irresistible Dance',
  level: 6,
  school: 'Enchantment',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Auto-Hit',
    save_effect: 'Negate',
  },
  condition_instances: [
    {
      condition: 'Special',
      description:
        'The target begins a comic dance in place. It must use all its movement to dance without leaving its space and has disadvantage on dexterity saving throws and attack rolls. Other creatures have advantage on attack rolls against it.',
      chance: 100,
    },
  ],
  description:
    "Choose one creature that you can see within range. The target begins a comic dance in place: shuffling, tapping its feet, and capering for the duration. Creatures that can't be charmed are immune to this spell. A dancing creature must use all its movement to dance without leaving its space and has disadvantage on dexterity saving throws and attack rolls. While the target is affected by this spell, other creatures have advantage on attack rolls against it. As an action, a dancing creature makes a wisdom saving throw to regain control of itself. On a successful save, the spell ends.",
  compilation_state: {
    status: 'Valid',
  },
});
