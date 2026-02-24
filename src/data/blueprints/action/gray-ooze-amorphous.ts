import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Amorphous',
  description: 'The ooze can move through a space as narrow as 1 inch wide without squeezing.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'gray-ooze-amorphous',
});
