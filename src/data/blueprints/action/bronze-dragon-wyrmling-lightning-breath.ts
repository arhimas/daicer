import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Lightning Breath',
  description:
    'The dragon exhales lightning in a 40-foot line that is 5 feet wide. Each creature in that line must make a DC 12 Dexterity saving throw, taking 16 (3d10) lightning damage on a failed save, or half as much damage on a successful one.',
  type: 'ranged',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 40,
    aoe_shape: 'Line',
    aoe_size: 5,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  save: {
    dc: 12,
    attribute: 'dex',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Lightning',
      dice_count: 3,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'bronze-dragon-wyrmling-lightning-breath',
});
