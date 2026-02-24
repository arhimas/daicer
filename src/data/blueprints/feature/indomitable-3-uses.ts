import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'indomitable-3-uses',
  name: 'Indomitable (3 uses)',
  compilation_state: {
    status: 'Valid',
    summary: 'Generated from 2014 SRD reference data.',
  },
  description:
    "Beginning at 9th level, you can reroll a saving throw that you fail. If you do so, you must use the new roll, and you can't use this feature again until you finish a long rest. You can use this feature twice between long rests starting at 13th level and three times between long rests starting at 17th level.",
  level: 17,
  tags: ['fighter'],
});
