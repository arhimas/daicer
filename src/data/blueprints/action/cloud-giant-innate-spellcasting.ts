import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Innate Spellcasting',
  description:
    "The giant's innate spellcasting ability is Charisma. It can innately cast the following spells, requiring no material components: At will: detect magic, fog cloud, light; 3/day each: feather fall, fly, misty step, telekinesis; 1/day each: control weather, gaseous form",
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'cloud-giant-innate-spellcasting',
});
