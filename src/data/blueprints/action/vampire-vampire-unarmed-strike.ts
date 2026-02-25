import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Unarmed Strike',
  description: 'The vampire makes one unarmed strike.',
  type: 'melee',
  toHit: 9,
  range_config: {
    type: 'Touch',
    distance: 5,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Melee Spell Attack',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 4,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 18',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'vampire-vampire-unarmed-strike',
});
