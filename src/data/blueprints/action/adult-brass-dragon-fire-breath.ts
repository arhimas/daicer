import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Fire Breath',
  description:
    'The dragon exhales fire in an 60-foot line that is 5 feet wide. Each creature in that line must make a DC 18 Dexterity saving throw, taking 45 (13d6) fire damage on a failed save, or half as much damage on a successful one. (Recharge 5-6)',
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
      damage_type: 'Fire',
      dice_count: 13,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  slug: 'adult-brass-dragon-fire-breath',
});
