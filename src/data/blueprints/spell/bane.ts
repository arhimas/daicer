import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'bane',
  name: 'Bane',
  level: 1,
  school: 'Enchantment',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A drop of blood.',
      somatic: true,
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
    action_type: 'Charisma Save',
    save_effect: 'Negate',
  },
  damage_instances: [],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Subtract a d4 from attack rolls and saving throws.',
      chance: 100,
      duration_rounds: 10,
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Target',
    method: 'Per Slot Level',
  },
  description:
    'Up to three creatures of your choice that you can see within range must make charisma saving throws. Whenever a target that fails this saving throw makes an attack roll or a saving throw before the spell ends, the target must roll a d4 and subtract the number rolled from the attack roll or saving throw.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  tags: ['bard', 'cleric', 'debuff'],
});
