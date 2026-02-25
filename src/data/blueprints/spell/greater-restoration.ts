import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'greater-restoration',
  name: 'Greater Restoration',
  level: 5,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: true,
      cost_gp: 100,
      material: true,
      material_description: 'Diamond dust worth at least 100gp, which the spell consumes.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  condition_instances: [
    {
      condition: 'Exhaustion',
      description: "Reduces the target's exhaustion level by one.",
      chance: 100,
    },
    {
      condition: 'Charmed',
      description: 'Ends one effect that charmed the target.',
      chance: 100,
    },
    {
      condition: 'Petrified',
      description: 'Ends one effect that petrified the target.',
      chance: 100,
    },
    {
      condition: 'Special',
      description:
        "Ends one curse, any reduction to an ability score, or one effect reducing the target's hit point maximum.",
      chance: 100,
    },
  ],
  description:
    "You imbue a creature you touch with positive energy to undo a debilitating effect. You can reduce the target's exhaustion level by one, or end one of the following effects on the target:\n\n- One effect that charmed or petrified the target\n- One curse, including the target's attunement to a cursed magic item\n- Any reduction to one of the target's ability scores\n- One effect reducing the target's hit point maximum",
  compilation_state: {
    status: 'Valid',
  },
});
