import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'healers-kit',
  name: "Healer's Kit",
  description:
    'This kit is a leather pouch containing bandages, salves, and splints. The kit has ten uses. As an action, you can expend one use of the kit to stabilize a creature that has 0 hit points, without needing to make a Wisdom (Medicine) check.',
  type: 'tool',
  rarity: 'common',
  value: 5,
  weight: 3,
  size: 'Medium',
});
