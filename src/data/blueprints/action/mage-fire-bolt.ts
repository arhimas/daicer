import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'fire bolt',
  description:
    "A streak of flame lances out at a target within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn't being worn or carried.",
  type: 'spell',
  toHit: 6,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Ranged Spell Attack',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 1,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'mage-fire-bolt',
});
