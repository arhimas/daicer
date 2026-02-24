import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Fire Breath',
  description:
    'The dragon exhales fire in a 90-foot cone. Each creature in that area must make a DC 24 Dexterity saving throw, taking 71 (13d10) fire damage on a failed save, or half as much damage on a successful one.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Cone',
    aoe_size: 90,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  save: {
    dc: 24,
    attribute: 'dex',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 13,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ancient-gold-dragon-fire-breath',
});
