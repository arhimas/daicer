import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'domain-spells',
  name: 'Domain Spells',
  compilation_state: {
    status: 'Valid',
    summary: 'Cleric class feature for domain spells at level 7.',
  },
  description:
    "Each domain has a list of spells—its domain spells—that you gain at the cleric levels noted in the domain description. Once you gain a domain spell, you always have it prepared, and it doesn't count against the number of spells you can prepare each day. If you have a domain spell that doesn't appear on the cleric spell list, the spell is nonetheless a cleric spell for you.",
  level: 7,
  lore: "As a cleric's connection to their deity deepens, specific miracles become second nature, woven directly into their soul by divine mandate.",
  tags: ['cleric'],
});
