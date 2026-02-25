import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-repelling-blast',
  name: 'Eldritch Invocation: Repelling Blast',
  compilation_state: {
    status: 'Valid',
    hash: 'b2f8a1c3e4d5f6a7',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully parsed from reference data.',
  },
  description:
    'When you hit a creature with eldritch blast, you can push the creature up to 10 feet away from you in a straight line.',
  embedding: {},
  image: 'https://example.com/images/repelling-blast.webp',
  level: 2,
  lore: "By weaving kinetic force into the crackling beams of their patron's power, a warlock can physically shove enemies backward with every hit.",
  tags: ['warlock', 'eldritch-invocation', 'eldritch-blast-modifier'],
});
