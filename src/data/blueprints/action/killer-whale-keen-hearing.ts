import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Hearing',
  description: 'The whale has advantage on Wisdom (Perception) checks that rely on hearing.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'killer-whale-keen-hearing',
});
