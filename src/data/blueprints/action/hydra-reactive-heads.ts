import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Reactive Heads',
  description:
    'For each head the hydra has beyond one, it gets an extra reaction that can be used only for opportunity attacks.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'hydra-reactive-heads',
});
