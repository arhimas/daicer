import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Charm Person',
  description: 'charm person',
  type: 'spell',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 18,
    attribute: 'wis',
  },
  slug: 'rakshasa-charm-person',
});
