import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'sacred-oath-feature',
  name: 'Sacred Oath feature',
  compilation_state: {
    status: 'Valid',
    summary: 'Generated from reference data.',
  },
  description:
    'At 15th level, you gain a feature granted by your Sacred Oath. Your choice of oath grants you features at 3rd level and again at 7th, 15th, and 20th level. Those features include oath spells and the Channel Divinity feature.',
  level: 15,
  lore: "The paladin's oath is more than a promise; it is a source of divine power that manifests in unique abilities as the paladin grows in conviction and experience.",
  tags: ['paladin', 'sacred-oath'],
});
