import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Standing Leap',
  description:
    "The bulette's long jump is up to 30 ft. and its high jump is up to 15 ft., with or without a running start.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'bulette-standing-leap',
});
