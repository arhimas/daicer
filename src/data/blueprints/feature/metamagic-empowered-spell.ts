import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'metamagic-empowered-spell',
  name: 'Metamagic: Empowered Spell',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    'When you roll damage for a spell, you can spend 1 sorcery point to reroll a number of the damage dice up to your Charisma modifier (minimum of one). You must use the new rolls. You can use Empowered Spell even if you have already used a different Metamagic option during the casting of the spell.',
  level: 3,
  tags: ['sorcerer', 'metamagic'],
});
