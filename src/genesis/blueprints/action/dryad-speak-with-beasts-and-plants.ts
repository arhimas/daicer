import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Speak with Beasts and Plants',
  description: 'The dryad can communicate with beasts and plants as if they shared a language.',
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
  slug: 'dryad-speak-with-beasts-and-plants',
});
