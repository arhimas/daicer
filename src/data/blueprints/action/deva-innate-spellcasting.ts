import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Innate Spellcasting',
  description:
    "The deva's spellcasting ability is Charisma (spell save DC 17). The deva can innately cast the following spells, requiring only verbal components: At will: detect evil and good; 1/day each: commune, raise dead",
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: {
    dc: 17,
    attribute: 'cha',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'deva-innate-spellcasting',
});
