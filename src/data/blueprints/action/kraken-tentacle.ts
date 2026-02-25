import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Tentacle',
  description:
    'Melee Weapon Attack: +7 to hit, reach 30 ft., one target. Hit: 20 (3d6 + 10) bludgeoning damage, and the target is grappled (escape DC 18). Until this grapple ends, the target is restrained. The kraken has ten tentacles, each of which can grapple one target.',
  type: 'melee',
  toHit: 7,
  range_config: {
    type: 'Touch',
    distance: 30,
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
      damage_type: 'Bludgeoning',
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 10,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 18',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Restrained',
      description: null,
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'kraken-tentacle',
});
