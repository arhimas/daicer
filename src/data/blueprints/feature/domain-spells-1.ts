import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'domain-spells',
  name: 'Domain Spells',
  compilation_state: {
    status: 'Valid',
    hash: '4e8a1b2c3d4e5f6g7h8i9j0k',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    "Each domain has a list of spells--its domain spells--that you gain at the cleric levels noted in the domain description. Once you gain a domain spell, you always have it prepared, and it doesn't count against the number of spells you can prepare each day. If you have a domain spell that doesn't appear on the cleric spell list, the spell is nonetheless a cleric spell for you.",
  level: 1,
  lore: "A cleric's chosen domain represents their specific focus within their deity's portfolio, granting them unique magic that is always at their fingertips.",
  tags: ['cleric'],
});
