import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Dominate Person',
  description: 'dominate person',
  type: 'spell',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 18,
    attribute: 'wis',
  },
  slug: 'rakshasa-dominate-person',
});
