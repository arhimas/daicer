import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Web Sense',
  description:
    'While in contact with a web, the spider knows the exact location of any other creature in contact with the same web.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'giant-wolf-spider-web-sense',
});
