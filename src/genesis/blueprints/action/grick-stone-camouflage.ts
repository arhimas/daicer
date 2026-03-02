import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Stone Camouflage',
  description: 'The grick has advantage on Dexterity (Stealth) checks made to hide in rocky terrain.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'grick-stone-camouflage',
});
