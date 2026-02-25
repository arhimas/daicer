import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'circle-of-the-land',
  name: 'Circle of the Land',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    "The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites through a vast oral tradition. These druids meet within sacred circles of trees or standing stones to whisper primal secrets in Druidic. The circle's wisest members preside as the chief priests of communities that hold to the Old Faith and serve as advisors to the rulers of those folk. As a member of this circle, your magic is influenced by the land where you were initiated into the circle's mysterious rites.",
  level: 2,
  tags: ['druid', 'subclass-feature'],
});
