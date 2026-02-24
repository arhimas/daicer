import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Web',
  description:
    'Ranged Weapon Attack: +5 to hit, range 30/60 ft., one creature. Hit: The target is restrained by webbing. As an action, the restrained target can make a DC 12 Strength check, bursting the webbing on a success. The webbing can also be attacked and destroyed (AC 10; hp 5; vulnerability to fire damage; immunity to bludgeoning, poison, and psychic damage).',
  type: 'ranged',
  toHit: 5,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  mechanics_config: {
    action_type: 'None',
  },
  condition_instances: [
    {
      condition: 'Restrained',
      description:
        'by webbing. As an action, the restrained target can make a DC 12 Strength check, bursting the webbing on a success. The webbing can also be attacked and destroyed (AC 10; hp 5; vulnerability to fire damage; immunity to bludgeoning, poison, and psychic damage).',
      chance: 100,
    },
  ],
  slug: 'giant-spider-web',
});
