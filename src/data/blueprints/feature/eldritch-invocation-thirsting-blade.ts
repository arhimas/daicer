import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-thirsting-blade',
  name: 'Eldritch Invocation: Thirsting Blade',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'You can attack with your pact weapon twice, instead of once, whenever you take the Attack action on your turn.',
  level: 5,
  tags: ['warlock', 'eldritch-invocation', 'pact-of-the-blade'],
});
