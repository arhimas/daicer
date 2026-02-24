import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Sacred Flame',
  description:
    'The acolyte casts Sacred Flame. Target must succeed on a DC 12 Dexterity saving throw or take 1d8 radiant damage.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 12,
    attribute: 'dex',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Radiant',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'acolyte-sacred-flame',
});
