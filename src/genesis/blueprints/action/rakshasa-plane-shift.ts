import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Plane Shift',
  description: 'plane shift',
  type: 'spell',
  range_config: {
    type: 'Touch',
  },
  mechanics_config: {
    action_type: 'Charisma Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 18,
    attribute: 'cha',
  },
  slug: 'rakshasa-plane-shift',
});
