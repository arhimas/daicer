import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'net',
  name: 'Net',
  description:
    'A Large or smaller creature hit by a net is restrained until it is freed. A net has no effect on creatures that are formless, or creatures that are Huge or larger. A creature can use its action to make a DC 10 Strength check, freeing itself or another creature within its reach on a success. Dealing 5 slashing damage to the net (AC 10) also frees the creature without harming it, ending the effect and destroying the net. When you use an action, bonus action, or reaction to attack with a net, you can make only one attack regardless of the number of attacks you can normally make.',
  type: 'weapon',
  rarity: 'common',
  value: 0,
  weight: 0,
  size: 'Medium',
  equipment_data: {
    range_normal: 5,
    str_minimum: 0,
    stealth_disadvantage: false,
  },
});
