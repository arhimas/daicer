import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'destroy-undead-cr-4-or-below',
  name: 'Destroy Undead (CR 4 or below)',
  compilation_state: {
    status: 'Valid',
    hash: '9f8e7d6c5b4a3210',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Feature mapped from SRD data.',
  },
  description:
    'Starting at 5th level, when an undead fails its saving throw against your Turn Undead feature, the creature is instantly destroyed if its challenge rating is at or below a certain threshold. At 17th level, any undead creature with a challenge rating of 4 or lower that fails its saving throw against your Turn Undead is destroyed instantly.',
  embedding: {},
  image: '',
  level: 17,
  lore: 'Your connection to the divine has grown so powerful that the mere sight of your holy symbol can reduce powerful undead to ash.',
  tags: ['cleric', 'class-feature', 'undead'],
});
