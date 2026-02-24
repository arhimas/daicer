import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'song-of-rest-d10',
  name: 'Song of Rest (d10)',
  compilation_state: {
    status: 'Valid',
    hash: '76f4e24a',
    last_run: '2023-10-27',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    'Beginning at 2nd level, you can use soothing music or oration to help revitalize your wounded allies during a short rest. If you or any friendly creatures who can hear your performance regain hit points at the end of the short rest by spending one or more Hit Dice, each of those creatures regains an extra 1d10 hit points. The extra hit points increase when you reach certain levels in this class: to 1d8 at 9th level, to 1d10 at 13th level, and to 1d12 at 17th level.',
  embedding: {},
  image: 'https://www.example.com/assets/bard-feature.png',
  level: 13,
  lore: 'A melody that mends the spirit as much as the flesh, carrying the weary through the longest of nights.',
  tags: ['bard', 'class-feature'],
});
