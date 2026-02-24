import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Teleport',
  description:
    'The sphinx magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see.',
  type: 'spell',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'gynosphinx-teleport',
});
