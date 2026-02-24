import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Healing Touch',
  description:
    'The planetar touches another creature. The target magically regains 30 (6d8 + 3) hit points and is freed from any curse, disease, poison, blindness, or deafness.',
  type: 'utility',
  range_config: {
    type: 'Touch',
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Healing',
      damage_type: null,
      dice_count: 6,
      dice_value: 8,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Freed from any curse, disease, poison, blindness, or deafness.',
      chance: 100,
    },
  ],
  slug: 'planetar-healing-touch',
});
