import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 22 (3d8 + 9) piercing damage. If the target is a Large or smaller creature, it must succeed on a DC 19 Dexterity saving throw or be swallowed by the worm. A swallowed creature is blinded and restrained, it has total cover against attacks and other effects outside the worm, and it takes 21 (6d6) acid damage at the start of each of the worm's turns. If the worm takes 30 damage or more on a single turn from a creature inside it, the worm must succeed on a DC 21 Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, which fall prone in a space within 10 feet of the worm. If the worm dies, a swallowed creature is no longer restrained by it and can escape from the corpse by using 20 feet of movement, exiting prone.",
  type: 'melee',
  toHit: 9,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 10,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: {
    dc: 19,
    attribute: 'dex',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 3,
      dice_value: 8,
      flat_bonus: 9,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Acid',
      dice_count: 6,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: [
    {
      condition: 'Blinded',
      description: null,
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Restrained',
      description: null,
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Special',
      description: 'total cover against attacks and other effects outside the worm',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'purple-worm-bite',
});
