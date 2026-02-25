import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Healing Touch',
  description:
    'The deva touches another creature. The target magically regains 20 (4d8 + 2) hit points and is freed from any curse, disease, poison, blindness, or deafness.',
  type: 'utility',
  toHit: null,
  range_config: {
    type: 'Touch',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Healing',
      damage_type: null,
      dice_count: 4,
      dice_value: 8,
      flat_bonus: 2,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Freed from any curse, disease, poison, blindness, or deafness.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'deva-healing-touch',
});
