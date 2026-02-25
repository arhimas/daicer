import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Vicious Mockery',
  description:
    'The hag can innately cast vicious mockery at will, requiring no material components. (Spell save DC 12 Charisma)',
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Charisma Save',
    save_effect: 'None',
  },
  save: {
    dc: 12,
    attribute: 'cha',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'green-hag-vicious-mockery',
});
