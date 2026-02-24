import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Wakeful',
  description: "When one of the ettin's heads is asleep, its other head is awake.",
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'ettin-wakeful',
});
