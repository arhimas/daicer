import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Shadow Stealth',
  description:
    'While in dim light or darkness, the shadow can take the Hide action as a bonus action. Its stealth bonus is also improved to +6.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'shadow-shadow-stealth',
});
