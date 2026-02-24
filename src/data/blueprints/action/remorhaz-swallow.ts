import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Swallow',
  description:
    "The remorhaz makes one bite attack against a Medium or smaller creature it is grappling. If the attack hits, that creature takes the bite's damage and is swallowed, and the grapple ends. While swallowed, the creature is blinded and restrained, it has total cover against attacks and other effects outside the remorhaz, and it takes 21 (6d6) acid damage at the start of each of the remorhaz's turns. If the remorhaz takes 30 damage or more on a single turn from a creature inside it, the remorhaz must succeed on a DC 15 Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, which fall prone in a space within 10 feet of the remorhaz. If the remorhaz dies, a swallowed creature is no longer restrained by it and can escape from the corpse using 15 feet of movement, exiting prone.",
  type: 'utility',
  toHit: null,
  range_config: {
    type: 'Touch',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: [
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
      description: 'while swallowed',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Restrained',
      description: 'while swallowed',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Special',
      description: 'Swallowed',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'remorhaz-swallow',
});
