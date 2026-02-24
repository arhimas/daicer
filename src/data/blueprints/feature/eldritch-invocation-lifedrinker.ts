import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-lifedrinker',
  name: 'Eldritch Invocation: Lifedrinker',
  compilation_state: {
    status: 'Valid',
    hash: 'a7b8c9d0',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Feature successfully mapped from SRD source.',
  },
  description:
    'When you hit a creature with your pact weapon, the creature takes extra necrotic damage equal to your Charisma modifier (minimum 1).',
  embedding: {},
  image: '',
  level: 12,
  lore: "The warlock's pact weapon becomes a conduit for necrotic energy, draining the life essence of those it strikes to empower the wielder's blow.",
  tags: ['warlock', 'eldritch-invocation', 'pact-of-the-blade'],
});
