import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Spider Climb',
  description:
    'The spider can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'giant-wolf-spider-spider-climb',
});
