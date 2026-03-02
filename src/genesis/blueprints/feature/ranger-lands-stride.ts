import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'lands-stride',
  name: "Land's Stride",
  compilation_state: {
    status: 'Valid',
  },
  description:
    'Starting at 8th level, moving through nonmagical difficult terrain costs you no extra movement. You can also pass through nonmagical plants without being slowed by them and without taking damage from them if they have thorns, spines, or a similar hazard. In addition, you have advantage on saving throws against plants that are magically created or manipulated to impede movement, such those created by the entangle spell.',
  embedding: {},
  level: 8,
  tags: ['ranger'],
});
