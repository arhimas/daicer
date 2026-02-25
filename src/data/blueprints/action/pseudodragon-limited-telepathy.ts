import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Limited Telepathy',
  description:
    'The pseudodragon can magically communicate simple ideas, emotions, and images telepathically with any creature within 100 ft. of it that can understand a language.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 100,
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
  slug: 'pseudodragon-limited-telepathy',
});
