import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Insect Plague',
  description: 'insect plague',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 300,
    aoe_shape: 'Cylinder',
    aoe_size: 20,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  save: {
    dc: 17,
    attribute: 'con',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'mummy-lord-insect-plague',
});
