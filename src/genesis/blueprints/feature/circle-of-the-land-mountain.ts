import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'circle-of-the-land-mountain',
  name: 'Circle of the Land: Mountain',
  compilation_state: {
    status: 'Valid',
    hash: '7d8f9a2b',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully generated from reference data.',
  },
  description:
    "Your mystic connection to the land infuses you with the ability to cast certain spells. At 3rd, 5th, 7th, and 9th level you gain access to circle spells connected to the mountain. Once you gain access to a circle spell, you always have it prepared, and it doesn't count against the number of spells you can prepare each day. If you gain access to a spell that doesn't appear on the druid spell list, the spell is nonetheless a druid spell for you. Mountain Spells: 3rd level (Spider Climb, Spike Growth), 5th level (Lightning Bolt, Meld into Stone), 7th level (Stone Shape, Stoneskin), 9th level (Passwall, Wall of Stone).",
  embedding: {},
  image: 'https://www.example.com/images/mountain-circle.jpg',
  level: 2,
  lore: "The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites through a vast oral tradition. These druids meet within sacred circles of trees or standing stones to whisper primal secrets in Druidic. As a member of this circle, your magic is influenced by the land where you were initiated into the circle's mysterious rites.",
  tags: ['druid', 'subclass-feature', 'land-circle'],
});
