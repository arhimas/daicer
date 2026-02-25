import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Acid Breath',
  description:
    'The dragon exhales acid in an 90-foot line that is 10 feet wide. Each creature in that line must make a DC 22 Dexterity saving throw, taking 63 (14d8) acid damage on a failed save, or half as much damage on a successful one.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 90,
    aoe_shape: 'Line',
    aoe_size: 10,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  save: {
    dc: 22,
    attribute: 'dex',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Acid',
      dice_count: 14,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ancient-copper-dragon-acid-breath',
});
