import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: "Devil's Sight",
  description: "Magical darkness doesn't impede the devil's darkvision.",
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'horned-devil-devil-s-sight',
});
