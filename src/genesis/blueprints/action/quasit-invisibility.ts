import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Invisibility',
  description:
    'The quasit magically turns invisible until it attacks or uses Scare, or until its concentration ends (as if concentrating on a spell). Any equipment the quasit wears or carries is invisible with it.',
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
      description: 'until it attacks or uses Scare, or until its concentration ends',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'quasit-invisibility',
});
