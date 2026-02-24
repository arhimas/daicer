import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Hearing and Smell',
  description: 'The werewolf has advantage on Wisdom (Perception) checks that rely on hearing or smell.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'werewolf-hybrid-keen-hearing-and-smell',
});
