import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'mastiff',
  name: 'Mastiff',
  description:
    'A Mastiff is a Large, loyal dog used as a mount for Small creatures or as a guard animal. It belongs to the Mounts and Other Animals category.\n\n**Speed:** 40 ft/round\n**Capacity:** 195 lb.',
  type: 'loot',
  rarity: 'common',
  value: 25,
  weight: 0,
  size: 'Medium',
});
