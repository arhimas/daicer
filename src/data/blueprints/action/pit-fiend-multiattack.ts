import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    'The pit fiend makes four attacks: one with its bite, one with its claw, one with its mace, and one with its tail.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'pit-fiend-multiattack',
});
