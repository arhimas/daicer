import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Mimicry',
  description:
    'The hag can mimic animal sounds and humanoid voices. A creature that hears the sounds can tell they are imitations with a successful DC 14 Wisdom (Insight) check.',
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
  slug: 'green-hag-mimicry',
});
