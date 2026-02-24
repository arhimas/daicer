import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'extra-attack',
  name: 'Extra Attack',
  compilation_state: {
    status: 'Valid',
    summary: 'Standard Fighter class feature mapping.',
  },
  description:
    'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn. The number of attacks increases to three when you reach 11th level in this class and to four when you reach 20th level in this class.',
  level: 5,
  lore: 'Through rigorous training and combat experience, a warrior learns to strike with such speed that multiple blows can be landed in the time it takes others to swing once.',
  tags: ['fighter'],
});
