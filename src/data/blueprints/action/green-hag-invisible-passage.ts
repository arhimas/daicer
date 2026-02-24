import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Invisible Passage',
  description:
    'The hag magically turns invisible until she attacks or casts a spell, or until her concentration ends (as if concentrating on a spell). While invisible, she leaves no physical evidence of her passage, so she can be tracked only by magic. Any equipment she wears or carries is invisible with her.',
  type: 'utility',
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
      duration_rounds: null,
    },
  ],
  slug: 'green-hag-invisible-passage',
});
