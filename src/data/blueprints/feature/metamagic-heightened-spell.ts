import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'metamagic-heightened-spell',
  name: 'Metamagic: Heightened Spell',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'When you cast a spell that forces a creature to make a saving throw to resist its effects, you can spend 3 sorcery points to give one target of the spell disadvantage on its first saving throw made against the spell.',
  level: 3,
  tags: ['sorcerer', 'metamagic'],
});
