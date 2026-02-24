import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Magic Weapons',
  description: "The sphinx's weapon attacks are magical.",
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'gynosphinx-magic-weapons',
});
