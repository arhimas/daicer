import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'danger-sense',
  name: 'Danger Sense',
  compilation_state: {
    status: 'Valid',
    summary: 'Barbarian class feature generated from reference data.',
  },
  description:
    "At 2nd level, you gain an uncanny sense of when things nearby aren't as they should be, giving you an edge when you dodge away from danger. You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells. To gain this benefit, you can't be blinded, deafened, or incapacitated.",
  level: 2,
  tags: ['barbarian'],
});
