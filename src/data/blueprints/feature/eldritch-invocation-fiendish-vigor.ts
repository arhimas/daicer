import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-fiendish-vigor',
  name: 'Eldritch Invocation: Fiendish Vigor',
  compilation_state: {
    status: 'Valid',
    hash: '779907f6e36d4f7f6266396f7c68a960',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Compiled from OGL source material.',
  },
  description:
    'You can cast false life on yourself at will as a 1st-level spell, without expending a spell slot or material components.',
  level: 2,
  lore: "By weaving the dark energies of your patron into your own flesh, you can manifest a spectral layer of protection that wards off death's cold touch.",
  tags: ['warlock', 'eldritch-invocation'],
});
