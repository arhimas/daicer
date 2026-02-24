import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    'The chuul makes two pincer attacks. If the chuul is grappling a creature, the chuul can also use its tentacles once.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'chuul-multiattack',
});
