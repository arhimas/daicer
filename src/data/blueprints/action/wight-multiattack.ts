import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    'The wight makes two longsword attacks or two longbow attacks. It can use its Life Drain in place of one longsword attack.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'wight-multiattack',
});
