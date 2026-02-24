import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Pack Tactics',
  description:
    "The hawk has advantage on an attack roll against a creature if at least one of the hawk's allies is within 5 ft. of the creature and the ally isn't incapacitated.",
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
  slug: 'blood-hawk-pack-tactics',
});
