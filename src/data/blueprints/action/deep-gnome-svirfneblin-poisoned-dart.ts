import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Poisoned Dart',
  description:
    'Ranged Weapon Attack: +4 to hit, range 30/120 ft., one creature. Hit: 4 (1d4 + 2) piercing damage, and the target must succeed on a DC 12 Constitution saving throw or be poisoned for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success',
  type: 'ranged',
  toHit: 4,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 12,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 1,
      dice_value: 4,
      flat_bonus: 2,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Poisoned',
      description:
        'The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success',
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'deep-gnome-svirfneblin-poisoned-dart',
});
