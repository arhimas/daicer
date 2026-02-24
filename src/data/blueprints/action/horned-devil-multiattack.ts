import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    'The devil makes three melee attacks: two with its fork and one with its tail. It can use Hurl Flame in place of any melee attack.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'horned-devil-multiattack',
});
