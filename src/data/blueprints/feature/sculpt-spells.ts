import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'sculpt-spells',
  name: 'Sculpt Spells',
  compilation_state: {
    status: 'Valid',
    hash: '8f2a1b3c',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully parsed Sculpt Spells feature.',
  },
  description:
    "Beginning at 2nd level, you can create pockets of relative safety within the effects of your evocation spells. When you cast an evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 + the spell's level. The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save.",
  embedding: {},
  image: '',
  level: 2,
  lore: 'The evoker learns to weave strands of magic around allies, shielding them from the raw fury of their destructive spells.',
  tags: ['wizard', 'evocation', 'class-feature'],
});
