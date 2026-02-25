import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'aura-of-protection',
  name: 'Aura of Protection',
  compilation_state: {
    status: 'Valid',
    hash: '5c8d2b1a9f0e4c3b',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from source reference.',
  },
  description:
    'Starting at 6th level, whenever you or a friendly creature within 10 feet of you must make a saving throw, the creature gains a bonus to the saving throw equal to your Charisma modifier (with a minimum bonus of +1). You must be conscious to grant this bonus. At 18th level, the range of this aura increases to 30 feet.',
  embedding: {},
  image: '',
  level: 6,
  lore: "The paladin's presence is a beacon of divine safety, shielding allies from harm through pure force of will.",
  tags: ['paladin', 'aura', 'defense'],
});
