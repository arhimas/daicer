import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'adult-brass-dragon-multiattack',
});
