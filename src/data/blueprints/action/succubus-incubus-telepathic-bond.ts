import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Telepathic Bond',
  description:
    "The fiend ignores the range restriction on its telepathy when communicating with a creature it has charmed. The two don't even need to be on the same plane of existence.",
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
  slug: 'succubus-incubus-telepathic-bond',
});
