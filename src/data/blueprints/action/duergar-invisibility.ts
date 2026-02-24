import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Invisibility',
  description:
    'The duergar magically turns invisible until it attacks, casts a spell, or uses its Enlarge, or until its concentration is broken, up to 1 hour (as if concentrating on a spell). Any equipment the duergar wears or carries is invisible with it.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Invisible',
      description: null,
      chance: 100,
      duration_rounds: 600,
    },
  ],
  slug: 'duergar-invisibility',
});
