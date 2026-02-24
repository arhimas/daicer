import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'divine-domain-feature',
  name: 'Divine Domain feature',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from SRD 5.1 reference.',
  },
  description:
    'Choose one domain related to your deity, such as Knowledge, Life, Light, Nature, Tempest, Trickery, or War. Your domain grants you domain spells and other features when you choose it at 1st level. It also grants you additional ways to use Channel Divinity when you gain that feature at 2nd level, and additional benefits at 6th, 8th, and 17th levels.',
  level: 2,
  tags: ['cleric'],
});
