import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'aura-of-courage',
  name: 'Aura of Courage',
  compilation_state: {
    status: 'Valid',
    hash: '5c9e22b1',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Standard Paladin class feature mapping completed.',
  },
  description:
    "Starting at 10th level, you and friendly creatures within 10 feet of you can't be frightened while you are conscious. At 18th level, the range of this aura increases to 30 feet.",
  embedding: {},
  image: 'https://www.dndbeyond.com/sources/phb/paladin#AuraofCourage',
  level: 10,
  lore: 'The divine light within you radiates outward, steeling the hearts of those who stand by your side and ensuring that fear finds no purchase in the souls of your allies.',
  tags: ['paladin'],
});
