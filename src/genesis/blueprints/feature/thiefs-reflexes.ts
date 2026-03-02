import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'thiefs-reflexes',
  name: "Thief's Reflexes",
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from SRD data.',
  },
  description:
    "When you reach 17th level, you have become adept at laying ambushes and quickly escaping danger. You can take two turns during the first round of any combat. You take your first turn at your normal initiative and your second turn at your initiative minus 10. You can't use this feature when you are surprised.",
  level: 17,
  tags: ['rogue', 'thief', 'subclass-feature'],
});
