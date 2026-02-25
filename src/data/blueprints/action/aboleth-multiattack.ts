import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The aboleth makes three tentacle attacks.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'aboleth-multiattack',
});
