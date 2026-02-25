import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'cone of cold',
  description:
    'A blast of cold air erupts from your hands. Each creature in a 60-foot cone must make a Constitution saving throw. A creature takes 8d8 cold damage on a failed save, or half as much damage on a successful one.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Cone',
    aoe_size: 60,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  save: {
    dc: 14,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Cold',
      dice_count: 8,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'mage-cone-of-cold',
});
