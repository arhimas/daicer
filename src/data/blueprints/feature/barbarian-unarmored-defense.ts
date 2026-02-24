import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'unarmored-defense',
  name: 'Unarmored Defense',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.',
  level: 1,
  tags: ['barbarian'],
});
