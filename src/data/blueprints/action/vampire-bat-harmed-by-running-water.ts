import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Harmed by Running Water',
  description: 'The vampire takes 20 acid damage if it ends its turn in running water.',
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
      damage_type: 'Acid',
      dice_count: 0,
      dice_value: 0,
      flat_bonus: 20,
      timing: 'End of Turn',
    },
  ],
  condition_instances: null,
  slug: 'vampire-bat-harmed-by-running-water',
});
