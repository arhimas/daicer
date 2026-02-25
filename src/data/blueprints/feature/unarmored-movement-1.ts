import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'unarmored-movement',
  name: 'Unarmored Movement',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'Starting at 2nd level, your speed increases by 10 feet while you are not wearing armor or wielding a shield. This bonus increases when you reach certain monk levels, as shown in the Monk table. At 9th level, you gain the ability to move along vertical surfaces and across liquids on your turn without falling during the move.',
  level: 2,
  tags: ['monk'],
});
