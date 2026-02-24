import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'metamagic-extended-spell',
  name: 'Metamagic: Extended Spell',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    'When you cast a spell that has a duration of 1 minute or longer, you can spend 1 sorcery point to double its duration, to a maximum duration of 24 hours.',
  level: 3,
  lore: 'Sorcerers possess the innate ability to weave and stretch the very threads of magic, allowing their enchantments to linger far longer than those cast by mere scholars.',
  tags: ['sorcerer', 'metamagic'],
});
