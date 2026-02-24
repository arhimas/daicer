import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Guardian of Faith',
  description: 'guardian of faith',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  save: {
    dc: 17,
    attribute: 'dex',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'mummy-lord-guardian-of-faith',
});
