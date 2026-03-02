import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Petrifying Breath',
  description:
    'The gorgon exhales petrifying gas in a 30-foot cone. Each creature in that area must succeed on a DC 13 Constitution saving throw. On a failed save, a target begins to turn to stone and is restrained. The restrained target must repeat the saving throw at the end of its next turn. On a success, the effect ends on the target. On a failure, the target is petrified until freed by the greater restoration spell or other magic.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Cone',
    aoe_size: 30,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 13,
    attribute: 'con',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Restrained',
      description: 'Target begins to turn to stone and is restrained. Must repeat save at the end of its next turn.',
      chance: 100,
      duration_rounds: 1,
    },
    {
      condition: 'Petrified',
      description: 'Target is petrified until freed by greater restoration or other magic, on a second failed save.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'gorgon-petrifying-breath',
});
