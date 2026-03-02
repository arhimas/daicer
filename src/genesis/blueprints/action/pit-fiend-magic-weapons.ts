import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Magic Weapons',
  description: "The pit fiend's weapon attacks are magical.",
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'pit-fiend-magic-weapons',
});
