import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Water Breathing',
  description: 'The sea horse can breathe only underwater.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'sea-horse-water-breathing',
});
