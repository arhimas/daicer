import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Gibbering',
  description:
    "The mouther babbles incoherently while it can see any creature and isn't incapacitated. Each creature that starts its turn within 20 feet of the mouther and can hear the gibbering must succeed on a DC 10 Wisdom saving throw. On a failure, the creature can't take reactions until the start of its next turn and rolls a d8 to determine what it does during its turn. On a 1 to 4, the creature does nothing. On a 5 or 6, the creature takes no action or bonus action and uses all its movement to move in a randomly determined direction. On a 7 or 8, the creature makes a melee attack against a randomly determined creature within its reach or does nothing if it can't make such an attack.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 20,
    aoe_shape: 'Sphere',
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 10,
    attribute: 'wis',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: "Can't take reactions and rolls d8 for turn actions",
      chance: 100,
      duration_rounds: 1,
    },
  ],
  slug: 'gibbering-mouther-gibbering',
});
