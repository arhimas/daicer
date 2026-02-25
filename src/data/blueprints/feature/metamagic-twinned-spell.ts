import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'metamagic-twinned-spell',
  name: 'Metamagic: Twinned Spell',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "When you cast a spell that targets only one creature and doesn't have a range of self, you can spend a number of sorcery points equal to the spell's level to target a second creature in range with the same spell (1 sorcery point if the spell is a cantrip). To be eligible, a spell must be incapable of targeting more than one creature at the spell's current level. For example, magic missile and scorching ray aren't eligible, but ray of frost is.",
  level: 3,
  tags: ['sorcerer', 'metamagic'],
});
