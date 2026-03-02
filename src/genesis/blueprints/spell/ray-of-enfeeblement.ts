import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'ray-of-enfeeblement',
  name: 'Ray of Enfeeblement',
  level: 2,
  school: 'Necromancy',
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
    distance: 60,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Ranged Spell Attack',
    save_effect: 'Negate',
  },
  condition_instances: [
    {
      condition: 'Special',
      description: 'The target deals only half damage with weapon attacks that use Strength until the spell ends.',
      chance: 100,
    },
  ],
  description:
    "A black beam of enervating energy springs from your finger toward a creature within range. Make a ranged spell attack against the target. On a hit, the target deals only half damage with weapon attacks that use Strength until the spell ends.\n\nAt the end of each of the target's turns, it can make a constitution saving throw against the spell. On a success, the spell ends.",
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  tags: ['warlock', 'wizard', 'lore'],
});
