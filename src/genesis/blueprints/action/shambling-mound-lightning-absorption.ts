import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Lightning Absorption',
  description:
    'Whenever the shambling mound is subjected to lightning damage, it takes no damage and regains a number of hit points equal to the lightning damage dealt.',
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
      effect_type: 'Healing',
      damage_type: null,
      dice_count: 0,
      dice_value: 0,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
  ],
  condition_instances: null,
  slug: 'shambling-mound-lightning-absorption',
});
