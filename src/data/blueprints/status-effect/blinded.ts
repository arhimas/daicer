import { defineStatusEffect } from '../../../features/genesis-core/blueprints';

export default defineStatusEffect({
  slug: 'blinded',
  name: 'Blinded',
  compilation_state: {
    status: 'Valid',
    hash: 'a1b2c3d4e5f6',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from SRD source.',
  },
  description:
    "A blinded creature can't see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
  effects: {},
  embedding: {},
});
