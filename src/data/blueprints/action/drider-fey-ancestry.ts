import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Fey Ancestry',
  description:
    "The drider has advantage on saving throws against being charmed, and magic can't put the drider to sleep.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'drider-fey-ancestry',
});
