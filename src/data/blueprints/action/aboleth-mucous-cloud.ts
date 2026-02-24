import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Mucous Cloud',
  description:
    'While underwater, the aboleth is surrounded by transformative mucus. A creature that touches the aboleth or that hits it with a melee attack while within 5 ft. of it must make a DC 14 Constitution saving throw. On a failure, the creature is diseased for 1d4 hours. The diseased creature can breathe only underwater.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 5,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 14,
    attribute: 'con',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: 'diseased for 1d4 hours. The diseased creature can breathe only underwater.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'aboleth-mucous-cloud',
});
