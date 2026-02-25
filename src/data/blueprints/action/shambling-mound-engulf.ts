import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Engulf',
  description:
    "The shambling mound engulfs a Medium or smaller creature grappled by it. The engulfed target is blinded, restrained, and unable to breathe, and it must succeed on a DC 14 Constitution saving throw at the start of each of the mound's turns or take 13 (2d8 + 4) bludgeoning damage. If the mound moves, the engulfed target moves with it. The mound can have only one creature engulfed at a time.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 14,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 4,
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
      description: 'Unable to breathe',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'shambling-mound-engulf',
});
