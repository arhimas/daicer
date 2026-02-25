import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'fighting-style-dueling',
  name: 'Fighting Style: Dueling',
  compilation_state: {
    status: 'Valid',
    hash: '7a4e2b1c8f9d0e1a2b3c',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    'When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.',
  level: 1,
  lore: 'Mastery of the single-handed blade allows a combatant to strike with heightened precision and lethal force, whether protecting themselves with a shield or keeping a hand free for tactical maneuvers.',
  tags: ['fighter', 'fighting-style'],
});
