import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'circle-spells',
  name: 'Circle Spells',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "Your mystical connection to the land infuses you with the ability to cast certain spells. At 3rd, 5th, 7th, and 9th level you gain access to circle spells connected to the land where you became a druid. Choose that land--arctic, coast, desert, forest, grassland, mountain, or swamp--and consult the associated list of spells. Once you gain access to a circle spell, you always have it prepared, and it doesn't count against the number of spells you can prepare each day. If you gain access to a spell that doesn't appear on the druid spell list, the spell is nonetheless a druid spell for you.",
  level: 7,
  tags: ['druid', 'land'],
});
