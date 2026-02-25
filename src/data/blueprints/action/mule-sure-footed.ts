import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Sure-Footed',
  description:
    'The mule has advantage on Strength and Dexterity saving throws made against effects that would knock it prone.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'mule-sure-footed',
});
