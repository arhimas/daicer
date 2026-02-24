import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Ink Cloud',
  description:
    'While underwater, the kraken expels an ink cloud in a 60-foot radius. The cloud spreads around corners, and that area is heavily obscured to creatures other than the kraken. Each creature other than the kraken that ends its turn there must succeed on a DC 23 Constitution saving throw, taking 16 (3d10) poison damage on a failed save, or half as much damage on a successful one.',
  type: 'utility',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 60,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  save: {
    dc: 23,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Poison',
      dice_count: 3,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'End of Turn',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Heavily obscured to creatures other than the kraken',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'kraken-ink-cloud',
});
