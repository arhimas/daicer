import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail Attack',
  description: 'The dragon makes a tail attack.',
  type: 'melee',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'adult-bronze-dragon-tail-attack',
});
