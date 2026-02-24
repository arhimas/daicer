import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    'The devil makes three melee attacks: one with its tail and two with its claws. Alternatively, it can use Hurl Flame twice.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'barbed-devil-multiattack',
});
