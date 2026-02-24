import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail',
  description:
    'Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 10 (1d8 + 6) piercing damage. If the target is a creature other than an undead or a construct, it must succeed on a DC 17 Constitution saving throw or lose 10 (3d6) hit points at the start of each of its turns due to an infernal wound. Each time the devil hits the wounded target with this attack, the damage dealt by the wound increases by 10 (3d6). Any creature can take an action to stanch the wound with a successful DC 12 Wisdom (Medicine) check. The wound also closes if the target receives magical healing.',
  type: 'melee',
  toHit: 10,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 10,
  },
  mechanics_config: {
    action_type: 'None',
  },
  save: {
    dc: 17,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 6,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: null,
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description:
        'Infernal wound: lose 10 (3d6) hit points at the start of each of its turns. Damage increases by 10 (3d6) each time hit by this attack. Can be stanched with a DC 12 Wisdom (Medicine) check or magical healing.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'horned-devil-tail',
});
