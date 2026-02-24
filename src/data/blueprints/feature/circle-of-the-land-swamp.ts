import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'circle-of-the-land-swamp',
  name: 'Circle of the Land: Swamp',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "Your mystical connection to the land infuses you with the ability to cast certain spells. At 3rd, 5th, 7th, and 9th level you gain access to circle spells connected to the land where you became a druid. Once you gain access to a circle spell, you always have it prepared, and it doesn't count against the number of spells you can prepare each day. If you gain access to a spell that doesn't appear on the druid spell list, the spell is nonetheless a druid spell for you. For the Swamp terrain, you gain the following spells: 3rd level (darkness, Melf's acid arrow), 5th level (water walk, stinking cloud), 7th level (freedom of movement, locate creature), 9th level (insect plague, scrying).",
  level: 2,
  lore: "The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites through a vast oral tradition. These druids meet within sacred circles of trees or standing stones to whisper primal secrets in Druidic. The circle's wisest members preside as the chief priests of communities that hold to the Old Faith and serve as advisors to the rulers of those folk. As a member of this circle, your magic is influenced by the land where you were initiated into the circle's mysterious rites.",
  tags: ['druid', 'land', 'subclass-feature'],
});
