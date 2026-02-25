import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Incorporeal Movement',
  description:
    'The wraith can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object.',
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
      damage_type: 'Force',
      dice_count: 1,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'End of Turn',
    },
  ],
  condition_instances: null,
  slug: 'wraith-incorporeal-movement',
});
