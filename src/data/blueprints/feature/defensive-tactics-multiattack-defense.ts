import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'defensive-tactics-multiattack-defense',
  name: 'Defensive Tactics: Multiattack Defense',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully generated from reference data.',
  },
  description:
    'When a creature hits you with an attack, you gain a +4 bonus to AC against all subsequent attacks made by that creature for the rest of the turn.',
  embedding: {},
  image: '',
  level: 7,
  lore: "Hunters who face monstrous foes with multiple limbs or weapons learn to brace themselves after an initial blow, turning the enemy's momentum into a defensive advantage.",
  tags: ['ranger', 'hunter', 'defensive-tactics'],
});
