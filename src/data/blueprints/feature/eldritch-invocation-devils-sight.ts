import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-devils-sight',
  name: "Eldritch Invocation: Devil's Sight",
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully converted from reference data.',
  },
  description: 'You can see normally in darkness, both magical and nonmagical, to a distance of 120 feet.',
  embedding: {},
  image: '',
  level: 2,
  lore: "The warlock's eyes adapt to the deepest gloom, piercing even the unnatural shadows cast by otherworldly forces.",
  tags: ['warlock', 'eldritch-invocation'],
});
