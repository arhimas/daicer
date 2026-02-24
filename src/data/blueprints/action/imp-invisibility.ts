import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Invisibility',
  description:
    'The imp magically turns invisible until it attacks, or until its concentration ends (as if concentrating on a spell). Any equipment the imp wears or carries is invisible with it.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Invisible',
      description:
        'The imp magically turns invisible until it attacks, or until its concentration ends (as if concentrating on a spell). Any equipment the imp wears or carries is invisible with it.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'imp-invisibility',
});
