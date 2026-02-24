import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Disguise Self',
  description: 'disguise self',
  type: 'spell',
  range_config: {
    type: 'Self',
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'rakshasa-disguise-self',
});
