import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'superior-hunters-defense-uncanny-dodge',
  name: "Superior Hunter's Defense: Uncanny Dodge",
  compilation_state: {
    status: 'Valid',
  },
  description:
    "When an attacker that you can see hits you with an attack, you can use your reaction to halve the attack's damage against you.",
  embedding: {},
  level: 15,
  tags: ['ranger', 'hunter', 'superior-hunters-defense'],
});
