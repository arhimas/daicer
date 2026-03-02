import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Regeneration',
  description:
    "The troll regains 10 hit points at the start of its turn. If the troll takes acid or fire damage, this trait doesn't function at the start of the troll's next turn. The troll dies only if it starts its turn with 0 hit points and doesn't regenerate.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: [
    {
      effect_type: 'Healing',
      damage_type: null,
      dice_count: 0,
      dice_value: 0,
      flat_bonus: 10,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: null,
  slug: 'troll-regeneration',
});
