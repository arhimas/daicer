import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Swallow',
  description:
    "The frog makes one bite attack against a Small or smaller target it is grappling. If the attack hits, the target is swallowed, and the grapple ends. The swallowed target is blinded and restrained, it has total cover against attacks and other effects outside the frog, and it takes 5 (2d4) acid damage at the start of each of the frog's turns. The frog can have only one target swallowed at a time. If the frog dies, a swallowed creature is no longer restrained by it and can escape from the corpse using 5 ft. of movement, exiting prone.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Touch',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: null,
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Acid',
      dice_count: 2,
      dice_value: 4,
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
      description: 'Has total cover against attacks and other effects outside the frog.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'giant-frog-swallow',
});
