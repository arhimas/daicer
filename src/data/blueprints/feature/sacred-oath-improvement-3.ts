import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'sacred-oath-feature',
  name: 'Sacred Oath feature',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data for the level 20 Paladin feature.',
  },
  description:
    'At 20th level, you gain a feature granted by your Sacred Oath. Your choice of oath grants you features at 3rd level and again at 7th, 15th, and 20th level. Those features include oath spells and the Channel Divinity feature.',
  level: 20,
  lore: "The culmination of a paladin's journey is the final manifestation of their oath's power, transforming the knight into a living avatar of their sacred principles.",
  tags: ['paladin'],
});
