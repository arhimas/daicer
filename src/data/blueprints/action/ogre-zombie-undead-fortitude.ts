import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Undead Fortitude',
  description:
    'If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5+the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: null,
  },
  save: {
    dc: 5,
    attribute: 'con',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'ogre-zombie-undead-fortitude',
});
