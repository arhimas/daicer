import { defineStatusEffect } from '../../../features/genesis-core/blueprints';

export default defineStatusEffect({
  slug: 'deafened',
  name: 'Deafened',
  compilation_state: {
    status: 'Valid',
  },
  description: "A deafened creature can't hear and automatically fails any ability check that requires hearing.",
});
