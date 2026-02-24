import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Healing Touch',
  description:
    'The solar touches another creature. The target magically regains 40 (8d8 + 4) hit points and is freed from any curse, disease, poison, blindness, or deafness (4/day).',
  type: 'spell',
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
      dice_count: 8,
      dice_value: 8,
      flat_bonus: 4,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Freed from any curse',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Special',
      description: 'Freed from any disease',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Special',
      description: 'Freed from any poison',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Blinded',
      description: 'Freed from blindness',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Deafened',
      description: 'Freed from deafness',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'solar-healing-touch',
});
