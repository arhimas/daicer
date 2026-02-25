import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Innate Spellcasting',
  description:
    "The planetar's spellcasting ability is Charisma (spell save DC 20). The planetar can innately cast the following spells, requiring no material components: At will: detect evil and good, invisibility (self only); 3/day each: blade barrier, dispel evil and good, flame strike, raise dead; 1/day each: commune, control weather, insect plague",
  type: 'spell',
  mechanics_config: {
    action_type: 'None',
  },
  save: {
    dc: 20,
    attribute: 'cha',
  },
  slug: 'planetar-innate-spellcasting',
});
