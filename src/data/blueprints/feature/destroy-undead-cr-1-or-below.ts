import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'destroy-undead-cr-1-or-below',
  name: 'Destroy Undead (CR 1 or below)',
  compilation_state: {
    status: 'Valid',
    summary: 'Feature generated from SRD 2014 Cleric class data.',
  },
  description:
    'Starting at 5th level, when an undead fails its saving throw against your Turn Undead feature, the creature is instantly destroyed if its challenge rating is at or below a certain threshold. At 8th level, any undead of challenge rating 1 or lower that fails its saving throw against Turn Undead is destroyed.',
  level: 8,
  tags: ['cleric'],
});
