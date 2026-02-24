import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Hurl Flame',
  description:
    "Ranged Spell Attack: +7 to hit, range 150 ft., one target. Hit: 14 (4d6) fire damage. If the target is a flammable object that isn't being worn or carried, it also catches fire.",
  type: 'spell',
  toHit: 7,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 150,
  },
  mechanics_config: {
    action_type: 'Ranged Spell Attack',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 4,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: "If the target is a flammable object that isn't being worn or carried, it also catches fire.",
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'horned-devil-hurl-flame',
});
