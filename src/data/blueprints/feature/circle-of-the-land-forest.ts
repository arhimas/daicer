import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'circle-of-the-land-forest',
  name: 'Circle of the Land: Forest',
  compilation_state: {
    status: 'Valid',
    hash: '5c8a9e2f',
    last_run: '2023-10-27',
    summary: 'Successfully compiled Forest subclass feature for Circle of the Land.',
  },
  description:
    "Your mystic connection to the land infuses you with the ability to cast certain spells. At 3rd, 5th, 7th, and 9th level you gain access to circle spells connected to the land where you became a druid. Once you gain access to a circle spell, you always have it prepared, and it doesn't count against the number of spells you can prepare each day. If you gain access to a spell that doesn't appear on the druid spell list, the spell is nonetheless a druid spell for you. Forest Spells: 3rd level (barkskin, spider climb), 5th level (call lightning, plant growth), 7th level (divination, freedom of movement), 9th level (commune with nature, tree stride).",
  embedding: {},
  image: 'https://media.dndbeyond.com/features/druid-circle-of-the-land.png',
  level: 2,
  lore: "The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites through a vast oral tradition. These druids meet within sacred circles of trees or standing stones to whisper primal secrets in Druidic. The circle's wisest members preside as the chief priests of communities that hold to the Old Faith and serve as advisors to the rulers of those folk. As a member of this circle, your magic is influenced by the land where you were initiated into the circle's mysterious rites.",
  tags: ['druid', 'circle-of-the-land', 'subclass-feature'],
});
