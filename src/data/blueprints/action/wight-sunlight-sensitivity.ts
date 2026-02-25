import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Sunlight Sensitivity',
  description:
    'While in sunlight, the wight has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'wight-sunlight-sensitivity',
});
