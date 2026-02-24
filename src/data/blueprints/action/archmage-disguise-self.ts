import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Disguise Self',
  description: 'The archmage can cast disguise self at will.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'archmage-disguise-self',
});
