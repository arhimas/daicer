import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Hearing and Sight',
  description: 'The owl has advantage on Wisdom (Perception) checks that rely on hearing or sight.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'owl-keen-hearing-and-sight',
});
