import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'dragon-wings',
  name: 'Dragon Wings',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully converted from reference data.',
  },
  description:
    "At 14th level, you gain the ability to sprout a pair of dragon wings from your back, gaining a flying speed equal to your current speed. You can create these wings as a bonus action on your turn. They last until you dismiss them as a bonus action on your turn. You can't manifest your wings while wearing armor unless the armor is made to accommodate them, and clothing not made to accommodate your wings might be destroyed when you manifest them.",
  level: 14,
  lore: 'The physical manifestation of your draconic heritage allows you to take to the skies like your ancestors.',
  tags: ['sorcerer', 'draconic-bloodline'],
});
