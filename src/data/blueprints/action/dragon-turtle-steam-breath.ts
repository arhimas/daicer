import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Steam Breath',
  description:
    "The dragon turtle exhales scalding steam in a 60-foot cone. Each creature in that area must make a DC 18 Constitution saving throw, taking 52 (15d6) fire damage on a failed save, or half as much damage on a successful one. Being underwater doesn't grant resistance against this damage.",
  type: 'ability',
  range_config: {
    type: 'Self',
    aoe_shape: 'Cone',
    aoe_size: 60,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  save: {
    dc: 18,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 15,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  slug: 'dragon-turtle-steam-breath',
});
