import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'antitoxin-vial',
  name: 'Antitoxin (vial)',
  description:
    'A creature that drinks this vial of liquid gains advantage on saving throws against poison for 1 hour. It confers no benefit to undead or constructs.',
  type: 'consumable',
  rarity: 'common',
  value: 50,
  weight: 0,
  size: 'Medium',
});
