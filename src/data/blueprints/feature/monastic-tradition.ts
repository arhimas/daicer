import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'monastic-tradition',
  name: 'Monastic Tradition',
  compilation_state: {
    status: 'Valid',
    hash: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped Monastic Tradition feature.',
  },
  description:
    'When you reach 3rd level, you commit yourself to a monastic tradition, such as the Way of the Open Hand. Your tradition grants you features at 3rd level and again at 6th, 11th, and 17th level.',
  embedding: {},
  image: '',
  level: 3,
  lore: 'The traditions of the monasteries are as varied as the lands they inhabit, ranging from the pursuit of physical perfection to the mastery of elemental forces.',
  tags: ['monk', 'class-feature', 'subclass-selection'],
});
