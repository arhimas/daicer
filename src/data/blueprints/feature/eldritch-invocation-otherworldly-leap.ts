import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-otherworldly-leap',
  name: 'Eldritch Invocation: Otherworldly Leap',
  compilation_state: {
    status: 'Valid',
    summary: 'Warlock Eldritch Invocation requiring 9th level.',
  },
  description: 'You can cast jump on yourself at will, without expending a spell slot or material components.',
  level: 9,
  tags: ['warlock', 'eldritch-invocation'],
});
