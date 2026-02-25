import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Barbed Hide',
  description:
    'At the start of each of its turns, the barbed devil deals 5 (1d10) piercing damage to any creature grappling it.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Auto-Hit',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 1,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: null,
  slug: 'barbed-devil-barbed-hide',
});
