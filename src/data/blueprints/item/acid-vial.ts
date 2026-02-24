import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'acid-vial',
  name: 'Acid (vial)',
  description:
    'As an action, you can splash the contents of this vial onto a creature within 5 feet of you or throw the vial up to 20 feet, shattering it on impact. In either case, make a ranged attack against a creature or object, treating the acid as an improvised weapon. On a hit, the target takes 2d6 acid damage.',
  type: 'consumable',
  rarity: 'common',
  value: 25,
  weight: 1,
  size: 'Medium',
  equipment_data: {
    damage_dice: '2d6',
    damage_type: 'acid',
    range_normal: 20,
    str_minimum: 0,
  },
});
