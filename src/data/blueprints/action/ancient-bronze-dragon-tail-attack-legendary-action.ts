import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail Attack (Legendary Action)',
  description:
    'The dragon makes a tail attack. Melee Weapon Attack: +16 to hit, reach 20 ft., one target. Hit: 18 (2d8 + 9) bludgeoning damage.',
  type: 'melee',
  toHit: 16,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 20,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 9,
      timing: 'Instant',
    },
  ],
  slug: 'ancient-bronze-dragon-tail-attack-legendary-action',
});
