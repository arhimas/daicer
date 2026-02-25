import { defineRace } from '@/features/genesis-core/blueprints';

export default defineRace({
  slug: 'dragonborn',
  name: 'Dragonborn',
  description:
    'Young dragonborn grow quickly. They walk hours after hatching, attain the size and development of a 10-year-old human child by the age of 3, and reach adulthood by 15. They live to be around 80. Dragonborn tend to extremes, making a conscious choice for one side or the other in the cosmic war between good and evil. Dragonborn are taller and heavier than humans, standing well over 6 feet tall and averaging almost 250 pounds. You can speak, read, and write Common and Draconic. Draconic is thought to be one of the oldest languages and is often used in the study of magic.',
  size: 'Medium',
  speed: {},
  traits: ['draconic-ancestry', 'breath-weapon', 'damage-resistance'],
  proficiencies: [],
  compilation_state: {
    status: 'Valid',
    hash: '786a9f8c12b3e4d5',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from 2014 SRD data.',
  },
  embedding: {},
  image: 'https://example.com/images/dragonborn.webp',
});
