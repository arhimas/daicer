import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Steam Breath',
  description:
    'The mephit exhales a 15-foot cone of scalding steam. Each creature in that area must succeed on a DC 10 Dexterity saving throw, taking 4 (1d8) fire damage on a failed save, or half as much damage on a successful one. (Recharge 6)',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Cone',
    aoe_size: 15,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  save: {
    dc: 10,
    attribute: 'dex',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'steam-mephit-steam-breath',
});
