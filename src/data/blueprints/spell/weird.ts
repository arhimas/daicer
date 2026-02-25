import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'weird',
  name: 'Weird',
  level: 9,
  school: 'Illusion',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
    aoe_shape: 'Sphere',
    aoe_size: 30,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Psychic',
      dice_count: 4,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: [
    {
      condition: 'Frightened',
      description: 'On a failed save, a creature becomes frightened for the duration.',
      chance: 100,
    },
  ],
  description:
    "Drawing on the deepest fears of a group of creatures, you create illusory creatures in their minds, visible only to them. Each creature in a 30-foot-radius sphere centered on a point of your choice within range must make a wisdom saving throw. On a failed save, a creature becomes frightened for the duration. The illusion calls on the creature's deepest fears, manifesting its worst nightmares as an implacable threat. At the start of each of the frightened creature's turns, it must succeed on a wisdom saving throw or take 4d10 psychic damage. On a successful save, the spell ends for that creature.",
  compilation_state: {
    status: 'Valid',
  },
});
