import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Amphibious',
  description: 'The dragon can breathe air and water.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'young-gold-dragon-amphibious',
});
