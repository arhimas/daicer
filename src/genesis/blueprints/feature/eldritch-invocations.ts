import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocations',
  name: 'Eldritch Invocations',
  compilation_state: {
    status: 'Valid',
    hash: 'd5e6f7g8',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Standard warlock class feature successfully generated.',
  },
  description:
    'In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability. At 2nd level, you gain two eldritch invocations of your choice. Your invocation options are detailed at the end of the class description. When you gain certain warlock levels, you gain additional invocations of your choice, as shown in the Invocations Known column of the Warlock table. Additionally, when you gain a level in this class, you can choose one of the invocations you know and replace it with another invocation that you could learn at that level.',
  embedding: {},
  level: 2,
  lore: 'Fragments of forbidden knowledge unearthed through the study of occult lore, granting permanent magical enhancements.',
  tags: ['warlock'],
});
