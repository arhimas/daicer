import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Immutable Form',
  description: 'The golem is immune to any spell or effect that would alter its form.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'flesh-golem-immutable-form',
});
