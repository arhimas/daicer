import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Smell',
  description: 'The rat has advantage on Wisdom (Perception) checks that rely on smell.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'rat-keen-smell',
});
