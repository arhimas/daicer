import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'lamp',
  name: 'Lamp',
  description:
    'A lamp casts bright light in a 15-foot radius and dim light for an additional 30 feet. Once lit, it burns for 6 hours on a flask (1 pint) of oil.',
  type: 'tool',
  rarity: 'common',
  value: 5,
  weight: 1,
  size: 'Medium',
  compilation_state: {
    status: 'Valid',
  },
  width: 1,
});
