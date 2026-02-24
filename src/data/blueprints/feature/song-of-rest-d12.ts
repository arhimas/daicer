import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'song-of-rest-d12',
  name: 'Song of Rest (d12)',
  compilation_state: {
    status: 'Valid',
    hash: '7f8e9a2b',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Feature successfully mapped from reference data.',
  },
  description:
    'Beginning at 2nd level, you can use soothing music or oration to help revitalize your wounded allies during a short rest. If you or any friendly creatures who can hear your performance regain hit points at the end of the short rest by spending one or more Hit Dice, each of those creatures regains an extra 1d6 hit points. The extra hit points increase when you reach certain levels in this class: to 1d8 at 9th level, to 1d10 at 13th level, and to 1d12 at 17th level.',
  level: 17,
  lore: "A master bard's performance is more than mere entertainment; it is a restorative balm for the soul, turning a simple rest into a profound recovery.",
  tags: ['bard', 'class-feature'],
});
