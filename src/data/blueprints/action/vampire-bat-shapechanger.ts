import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Shapechanger',
  description:
    "If the vampire isn't in sun light or running water, it can use its action to polymorph into a Tiny bat or a Medium cloud of mist, or back into its true form. While in bat form, the vampire can't speak, its walking speed is 5 feet, and it has a flying speed of 30 feet. Its statistics, other than its size and speed, are unchanged. Anything it is wearing transforms with it, but nothing it is carrying does. It reverts to its true form if it dies. While in mist form, the vampire can't take any actions, speak, or manipulate objects. It is weightless, has a flying speed of 20 feet, can hover, and can enter a hostile creature's space and stop there. In addition, if air can pass through a space, the mist can do so without squeezing, and it can't pass through water. It has advantage on Strength, Dexterity, and Constitution saving throws, and it is immune to all nonmagical damage, except the damage it takes from sunlight.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'vampire-bat-shapechanger',
});
