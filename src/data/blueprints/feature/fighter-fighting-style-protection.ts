import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'fighting-style-protection',
  name: 'Fighting Style: Protection',
  compilation_state: {
    status: 'Valid',
    hash: '6e8f11a4b9c2',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Feature successfully parsed from SRD data.',
  },
  description:
    'When a creature you can see attacks a target other than you that is within 5 feet of you, you can use your reaction to impose disadvantage on the attack roll. You must be wielding a shield.',
  embedding: {},
  image: 'https://www.example.com/assets/features/protection.png',
  level: 1,
  lore: 'A master of the shield knows that their protection extends beyond their own person, acting as a mobile bulwark for those standing beside them in the heat of battle.',
  tags: ['fighter', 'fighting-style', 'reaction', 'defensive'],
});
