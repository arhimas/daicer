import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Faultless Tracker',
  description:
    'The stalker is given a quarry by its summoner. The stalker knows the direction and distance to its quarry as long as the two of them are on the same plane of existence. The stalker also knows the location of its summoner.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'invisible-stalker-faultless-tracker',
});
