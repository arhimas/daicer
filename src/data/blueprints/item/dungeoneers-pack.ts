import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'dungeoneers-pack',
  name: "Dungeoneer's Pack",
  description:
    'Includes a backpack, a crowbar, a hammer, 10 pitons, 10 torches, a tinderbox, 10 days of rations, and a waterskin. The pack also has 50 feet of hempen rope strapped to the side of it.',
  type: 'container',
  rarity: 'common',
  value: 12,
  weight: 0,
  size: 'Medium',
  tags: ['adventuring-gear', 'equipment-packs'],
});
