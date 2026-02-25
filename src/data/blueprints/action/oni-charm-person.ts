import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Charm Person',
  description: '1/day spell: charm person',
  type: 'spell',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 13,
    attribute: 'wis',
  },
  condition_instances: [
    {
      condition: 'Charmed',
      description: null,
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'oni-charm-person',
});
