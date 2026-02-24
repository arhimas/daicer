import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-beast-speech',
  name: 'Eldritch Invocation: Beast Speech',
  compilation_state: {
    status: 'Valid',
    summary: 'Standard Eldritch Invocation for Warlocks.',
  },
  description: 'You can cast speak with animals at will, without expending a spell slot.',
  level: 2,
  tags: ['warlock', 'eldritch-invocations'],
});
