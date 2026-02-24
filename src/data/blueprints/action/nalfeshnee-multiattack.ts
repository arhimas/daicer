import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    'The nalfeshnee uses Horror Nimbus if it can. It then makes three attacks: one with its bite and two with its claws.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'nalfeshnee-multiattack',
});
