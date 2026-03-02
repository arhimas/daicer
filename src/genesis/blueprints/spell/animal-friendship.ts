import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'animal-friendship',
  name: 'Animal Friendship',
  level: 1,
  school: 'Enchantment',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A morsel of food.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  duration_config: {
    type: 'Time-Limited',
    value: 24,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  damage_instances: [],
  condition_instances: [
    {
      condition: 'Charmed',
      description:
        "The beast is charmed by you for the spell's duration. If you or one of your companions harms the target, the spell ends.",
      chance: 100,
    },
  ],
  description:
    "This spell lets you convince a beast that you mean it no harm. Choose a beast that you can see within range. It must see and hear you. If the beast's Intelligence is 4 or higher, the spell fails. Otherwise, the beast must succeed on a wisdom saving throw or be charmed by you for the spell's duration. If you or one of your companions harms the target, the spells ends.",
  compilation_state: {
    status: 'Valid',
    summary: 'Mapped from reference data.',
  },
  tags: ['bard', 'druid', 'ranger'],
});
