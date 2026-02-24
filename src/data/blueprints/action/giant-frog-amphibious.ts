import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Amphibious',
  description: 'The frog can breathe air and water',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'giant-frog-amphibious',
});
