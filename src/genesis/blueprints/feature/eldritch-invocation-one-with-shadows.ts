import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-one-with-shadows',
  name: 'Eldritch Invocation: One with Shadows',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'When you are in an area of dim light or darkness, you can use your action to become invisible until you move or take an action or a reaction.',
  level: 5,
  tags: ['warlock', 'eldritch-invocations'],
});
