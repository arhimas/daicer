import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Fire Form',
  description:
    "The elemental can move through a space as narrow as 1 inch wide without squeezing. A creature that touches the elemental or hits it with a melee attack while within 5 ft. of it takes 5 (1d10) fire damage. In addition, the elemental can enter a hostile creature's space and stop there. The first time it enters a creature's space on a turn, that creature takes 5 (1d10) fire damage and catches fire; until someone takes an action to douse the fire, the creature takes 5 (1d10) fire damage at the start of each of its turns.",
  type: 'ability',
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 1,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 1,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 1,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Catches fire, taking 1d10 fire damage at the start of each of its turns until doused.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'fire-elemental-fire-form',
});
