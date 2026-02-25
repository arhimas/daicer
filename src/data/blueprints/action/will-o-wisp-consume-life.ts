import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Consume Life',
  description:
    "As a bonus action, the will-o'-wisp can target one creature it can see within 5 ft. of it that has 0 hit points and is still alive. The target must succeed on a DC 10 Constitution saving throw against this magic or die. If the target dies, the will-o'-wisp regains 10 (3d6) hit points.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 5,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 10,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Healing',
      damage_type: null,
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'will-o-wisp-consume-life',
});
