import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Ambusher',
  description:
    'In the first round of combat, the doppelganger has advantage on attack rolls against any creature it has surprised.',
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
  slug: 'doppelganger-ambusher',
});
