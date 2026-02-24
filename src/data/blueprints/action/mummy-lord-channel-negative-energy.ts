import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Channel Negative Energy',
  description:
    "The mummy lord magically unleashes negative energy. Creatures within 60 feet of the mummy lord, including ones behind barriers and around corners, can't regain hit points until the end of the mummy lord's next turn.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 60,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description:
        "Creatures within 60 feet of the mummy lord, including ones behind barriers and around corners, can't regain hit points until the end of the mummy lord's next turn.",
      chance: 100,
      duration_rounds: 1,
    },
  ],
  slug: 'mummy-lord-channel-negative-energy',
});
