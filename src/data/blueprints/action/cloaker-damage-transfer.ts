import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Damage Transfer',
  description:
    'While attached to a creature, the cloaker takes only half the damage dealt to it (rounded down). and that creature takes the other half.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'cloaker-damage-transfer',
});
