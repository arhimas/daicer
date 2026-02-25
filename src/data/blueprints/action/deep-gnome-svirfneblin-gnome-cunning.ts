import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Gnome Cunning',
  description: 'The gnome has advantage on Intelligence, Wisdom, and Charisma saving throws against magic.',
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
  slug: 'deep-gnome-svirfneblin-gnome-cunning',
});
