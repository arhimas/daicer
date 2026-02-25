import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Innate Spellcasting',
  description:
    "The oni's innate spellcasting ability is Charisma (spell save DC 13). The oni can innately cast the following spells, requiring no material components: At will: darkness, invisibility; 1/day each: charm person, cone of cold, gaseous form, sleep",
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'oni-innate-spellcasting',
});
