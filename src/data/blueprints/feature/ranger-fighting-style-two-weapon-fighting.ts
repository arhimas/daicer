import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'fighting-style-two-weapon-fighting',
  name: 'Fighting Style: Two-Weapon Fighting',
  compilation_state: {
    status: 'Valid',
    summary: 'Generated from reference data.',
  },
  description:
    'When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack.',
  level: 2,
  tags: ['ranger', 'fighting-style'],
});
