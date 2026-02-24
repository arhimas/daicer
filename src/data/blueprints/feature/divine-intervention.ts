import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'divine-intervention',
  name: 'Divine Intervention',
  compilation_state: {
    status: 'Valid',
    hash: '8f7e6d5c4b3a2109',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully converted Divine Intervention class feature for Cleric.',
  },
  description:
    "Beginning at 10th level, you can call on your deity to intervene on your behalf when your need is great. Imploring your deity's aid requires you to use your action. Describe the assistance you seek, and roll percentile dice. If you roll a number equal to or lower than your cleric level, your deity intervenes. The GM chooses the nature of the intervention; the effect of any cleric spell or cleric domain spell would be appropriate. If your deity intervenes, you can't use this feature again for 7 days. Otherwise, you can use it again after you finish a long rest. At 20th level, your call for intervention succeeds automatically, no roll required.",
  embedding: {},
  image: 'https://media-waterdeep.cursecdn.com/avatars/features/divine-intervention.png',
  level: 10,
  lore: "A direct plea to the heavens, calling upon the divine power of one's patron deity to manifest in the mortal realm.",
  tags: ['cleric', 'class-feature', 'divine'],
});
