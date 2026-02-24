import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Sunlight Hypersensitivity',
  description:
    'The vampire takes 20 radiant damage when it starts its turn in sunlight. While in sunlight, it has disadvantage on attack rolls and ability checks.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Radiant',
      dice_count: 0,
      dice_value: 0,
      flat_bonus: 20,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Disadvantage on attack rolls and ability checks while in sunlight',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'vampire-bat-sunlight-hypersensitivity',
});
