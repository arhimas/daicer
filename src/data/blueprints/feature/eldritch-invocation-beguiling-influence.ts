import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-beguiling-influence',
  name: 'Eldritch Invocation: Beguiling Influence',
  compilation_state: {
    status: 'Valid',
    summary: 'Feature successfully imported from SRD reference.',
  },
  description: 'You gain proficiency in the Deception and Persuasion skills.',
  level: 2,
  lore: "The warlock's patron grants them a silver tongue and the ability to weave subtle enchantments into their speech, making their lies more believable and their requests more compelling.",
  tags: ['warlock', 'eldritch-invocation', 'proficiency'],
});
