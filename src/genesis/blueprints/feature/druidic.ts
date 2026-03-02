import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'druidic',
  name: 'Druidic',
  compilation_state: {
    status: 'Valid',
    summary: 'Standard Druid class feature.',
  },
  description:
    "You know Druidic, the secret language of druids. You can speak the language and use it to leave hidden messages. You and others who know this language automatically spot such a message. Others spot the message's presence with a successful DC 15 Wisdom (Perception) check but can't decipher it without magic.",
  embedding: {},
  image: 'https://example.com/images/druidic-feature.png',
  level: 1,
  lore: "The secret tongue of nature's guardians, whispered among the leaves and etched into the bark of ancient trees.",
  tags: ['druid', 'language', 'class-feature'],
});
