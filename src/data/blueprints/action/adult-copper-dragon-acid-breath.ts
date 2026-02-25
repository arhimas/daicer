import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Acid Breath',
  description:
    'The dragon exhales acid in an 60-foot line that is 5 feet wide. Each creature in that line must make a DC 18 Dexterity saving throw, taking 54 (12d8) acid damage on a failed save, or half as much damage on a successful one. (Recharge 5-6)',
  type: 'ability',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
    aoe_shape: 'Line',
    aoe_size: 5,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  save: {
    dc: 18,
    attribute: 'dex',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Acid',
      dice_count: 12,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  slug: 'adult-copper-dragon-acid-breath',
});
