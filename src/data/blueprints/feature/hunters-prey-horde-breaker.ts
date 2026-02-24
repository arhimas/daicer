import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'hunters-prey-horde-breaker',
  name: "Hunter's Prey: Horde Breaker",
  compilation_state: {
    status: 'Valid',
  },
  description:
    'Once on each of your turns when you make a weapon attack, you can make another attack with the same weapon against a different creature that is within 5 feet of the original target and within range of your weapon.',
  level: 3,
  tags: ['ranger', 'hunter'],
});
