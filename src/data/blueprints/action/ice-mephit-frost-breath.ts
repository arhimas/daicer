import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Frost Breath',
  description:
    'The mephit exhales a 15-foot cone of cold air. Each creature in that area must succeed on a DC 10 Dexterity saving throw, taking 5 (2d4) cold damage on a failed save, or half as much damage on a successful one.',
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
      damage_type: 'Cold',
      dice_count: 2,
      dice_value: 4,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ice-mephit-frost-breath',
});
