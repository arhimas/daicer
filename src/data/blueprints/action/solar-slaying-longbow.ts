import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Slaying Longbow',
  description:
    'Ranged Weapon Attack: +13 to hit, range 150/600 ft., one target. Hit: 15 (2d8 + 6) piercing damage plus 27 (6d8) radiant damage. If the target is a creature that has 190 hit points or fewer, it must succeed on a DC 15 Constitution saving throw or die.',
  type: 'ranged',
  toHit: 13,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 150,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Ranged Spell Attack',
    save_effect: null,
  },
  save: {
    dc: 15,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 6,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Radiant',
      dice_count: 6,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description:
        'If the target is a creature that has 190 hit points or fewer, it must succeed on a DC 15 Constitution saving throw or die.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'solar-slaying-longbow',
});
