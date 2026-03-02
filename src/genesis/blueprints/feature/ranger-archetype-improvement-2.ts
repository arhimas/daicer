import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ranger-archetype-feature',
  name: 'Ranger Archetype feature',
  compilation_state: {
    status: 'Valid',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Feature successfully compiled from SRD reference.',
  },
  description:
    'At 11th level, you gain a feature granted by your Ranger Archetype choice. The choice you made at 3rd level grants you features at 3rd level and again at 7th, 11th, and 15th level.',
  embedding: {},
  image: '',
  level: 11,
  lore: "As a ranger's experience grows, their specialization deepens, allowing them to master the unique techniques of their chosen path.",
  tags: ['ranger', 'class-feature'],
});
