import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'burglars-pack',
  name: "Burglar's Pack",
  description:
    'Includes a backpack, a bag of 1,000 ball bearings, 10 feet of string, a bell, 5 candles, a crowbar, a hammer, 10 pitons, a hooded lantern, 2 flasks of oil, 5 days of rations, a tinderbox, a waterskin, and 50 feet of hempen rope.',
  type: 'container',
  rarity: 'common',
  value: 16,
  weight: 0,
  size: 'Medium',
});
