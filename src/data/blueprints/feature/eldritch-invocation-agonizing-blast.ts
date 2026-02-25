import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-agonizing-blast',
  name: 'Eldritch Invocation: Agonizing Blast',
  compilation_state: {
    status: 'Valid',
  },
  description: 'When you cast eldritch blast, add your Charisma modifier to the damage it deals on a hit.',
  level: 2,
  lore: 'The warlock taps into the raw power of their patron to infuse their eldritch energy with personal force.',
  tags: ['warlock', 'eldritch-invocation'],
});
