import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Magic Resistance',
  description: 'The golem has advantage on saving throws against spells and other magical effects.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'flesh-golem-magic-resistance',
});
