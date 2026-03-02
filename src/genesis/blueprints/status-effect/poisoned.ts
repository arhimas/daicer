import { defineStatusEffect } from '@/features/genesis-core/blueprints';

export default defineStatusEffect({
  slug: 'poisoned',
  name: 'Poisoned',
  compilation_state: {
    status: 'Valid',
    hash: '98f2129b',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Validly parsed from 2014 SRD sources.',
  },
  description: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
  effects: {},
  embedding: {},
});
