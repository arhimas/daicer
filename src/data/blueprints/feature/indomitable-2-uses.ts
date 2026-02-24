import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'indomitable-2-uses',
  name: 'Indomitable (2 uses)',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "Beginning at 9th level, you can reroll a saving throw that you fail. If you do so, you must use the new roll, and you can't use this feature again until you finish a long rest. You can use this feature twice between long rests starting at 13th level and three times between long rests starting at 17th level.",
  level: 13,
  tags: ['fighter'],
});
