import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Treasure Sense',
  description:
    'The xorn can pinpoint, by scent, the location of precious metals and stones, such as coins and gems, within 60 ft. of it.',
  type: 'ability',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'xorn-treasure-sense',
});
