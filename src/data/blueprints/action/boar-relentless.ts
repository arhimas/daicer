import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Relentless',
  description:
    'If the boar takes 7 damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'boar-relentless',
});
