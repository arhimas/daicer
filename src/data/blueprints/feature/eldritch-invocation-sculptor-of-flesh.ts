import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-sculptor-of-flesh',
  name: 'Eldritch Invocation: Sculptor of Flesh',
  compilation_state: {
    status: 'Valid',
    hash: '4e8f9b2a1c7d3e5f6g7h8i9j0k1l2m3n',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    "You can cast polymorph once using a warlock spell slot. You can't do so again until you finish a long rest.",
  level: 7,
  lore: "By reaching into the malleable essence of mortality, a warlock can reshape the very physical form of a creature, a gift bestowed by their patron's reality-warping influence.",
  tags: ['warlock', 'eldritch-invocations'],
});
