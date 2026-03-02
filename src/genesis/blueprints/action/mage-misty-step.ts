import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'misty step',
  description:
    'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: 'Teleports up to 30 feet to an unoccupied space.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'mage-misty-step',
});
