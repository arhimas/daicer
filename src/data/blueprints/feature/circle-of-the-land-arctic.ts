import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'circle-of-the-land-arctic',
  name: 'Circle of the Land: Arctic',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully generated Circle of the Land: Arctic feature.',
  },
  description:
    "Your magic is influenced by the frozen wastes of the arctic where you were initiated into the circle's mysterious rites. At 3rd, 5th, 7th, and 9th level you gain access to circle spells connected to the land where you became a druid. Once you gain access to a circle spell, you always have it prepared, and it doesn't count against the number of spells you can prepare each day. If you gain access to a spell that doesn't appear on the druid spell list, the spell is nonetheless a druid spell for you. Arctic Spells: 3rd Level (hold person, spike growth), 5th Level (sleet storm, slow), 7th Level (freedom of movement, ice storm), 9th Level (commune with nature, cone of cold).",
  level: 2,
  lore: "The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites through a vast oral tradition. These druids meet within sacred circles of trees or standing stones to whisper primal secrets in Druidic. The circle's wisest members preside as the chief priests of communities that hold to the Old Faith and serve as advisors to the rulers of those folk.",
  tags: ['druid', 'subclass-feature', 'land-circle'],
});
