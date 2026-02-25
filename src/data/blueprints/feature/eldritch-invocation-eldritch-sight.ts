import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-eldritch-sight',
  name: 'Eldritch Invocation: Eldritch Sight',
  compilation_state: {
    status: 'Valid',
  },
  description: 'You can cast detect magic at will, without expending a spell slot.',
  level: 2,
  lore: 'Your eyes are opened to the invisible flows of magic that permeate the world, allowing you to perceive the subtle auras of the arcane with a mere thought.',
  tags: ['warlock', 'eldritch-invocations'],
});
