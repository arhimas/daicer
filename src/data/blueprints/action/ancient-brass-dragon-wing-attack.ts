import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Wing Attack',
  description:
    'The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 15,
    aoe_shape: 'Sphere',
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'None',
  },
  save: {
    dc: 22,
    attribute: 'dex',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 8,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Prone',
      description: null,
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'ancient-brass-dragon-wing-attack',
});
