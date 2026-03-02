import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'martial-archetype',
  name: 'Martial Archetype',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from Fighter class features.',
  },
  description:
    'At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques, such as Champion. The archetype you choose grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.',
  level: 3,
  tags: ['fighter'],
});
