import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Stone Camouflage',
  description: 'The giant has advantage on Dexterity (Stealth) checks made to hide in rocky terrain.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'stone-giant-stone-camouflage',
});
