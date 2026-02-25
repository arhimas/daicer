import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'sequester',
  name: 'Sequester',
  level: 7,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: true,
      cost_gp: 5000,
      material: true,
      material_description:
        'A powder composed of diamond, emerald, ruby, and sapphire dust worth at least 5,000 gp, which the spell consumes.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Until Dispelled',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [
    {
      condition: 'Invisible',
      description: 'The target becomes invisible for the duration.',
      chance: 100,
    },
    {
      condition: 'Special',
      description:
        "The target falls into a state of suspended animation. Time ceases to flow for it, and it doesn't grow older.",
      chance: 100,
    },
  ],
  description:
    'By means of this spell, a willing creature or an object can be hidden away, safe from detection for the duration. When you cast the spell and touch the target, it becomes invisible and can\'t be targeted by divination spells or perceived through scrying sensors created by divination spells.\n\nIf the target is a creature, it falls into a state of suspended animation. Time ceases to flow for it, and it doesn\'t grow older.\n\nYou can set a condition for the spell to end early. The condition can be anything you choose, but it must occur or be visible within 1 mile of the target. Examples include "after 1,000 years" or "when the tarrasque awakens." This spell also ends if the target takes any damage.',
  compilation_state: {
    status: 'Valid',
    summary: 'Sequester spell data mapped from reference.',
  },
  tags: ['wizard'],
});
