import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-eldritch-spear',
  name: 'Eldritch Invocation: Eldritch Spear',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from SRD data.',
  },
  description: 'Prerequisite: eldritch blast cantrip. When you cast eldritch blast, its range is 300 feet.',
  level: 2,
  tags: ['warlock', 'eldritch-invocation'],
});
