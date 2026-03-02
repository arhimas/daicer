import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'pact-of-the-chain',
  name: 'Pact of the Chain',
  compilation_state: {
    status: 'Valid',
    hash: '85f1c9a2',
    last_run: '2023-10-27',
    summary: 'Imported from SRD reference data',
  },
  description:
    "You learn the find familiar spell and can cast it as a ritual. The spell doesn't count against your number of spells known. When you cast the spell, you can choose one of the normal forms for your familiar or one of the following special forms: imp, pseudodragon, quasit, or sprite. Additionally, when you take the Attack action, you can forgo one of your own attacks to allow your familiar to make one attack of its own with its reaction.",
  level: 3,
  lore: 'Your familiar is more cunning than a typical familiar. Its default form can be a reflection of your patron, with imps and quasits tied to the Fiend.',
  tags: ['warlock', 'pact-boon'],
});
