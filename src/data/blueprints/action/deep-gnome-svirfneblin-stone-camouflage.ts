import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Stone Camouflage',
  description: 'The gnome has advantage on Dexterity (Stealth) checks made to hide in rocky terrain.',
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
  slug: 'deep-gnome-svirfneblin-stone-camouflage',
});
