import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Innate Spellcasting',
  description:
    "The solar's spell casting ability is Charisma (spell save DC 25). It can innately cast the following spells, requiring no material components: At will: detect evil and good, invisibility (self only); 3/day each: blade barrier, dispel evil and good, resurrection; 1/day each: commune, control weather.",
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: {
    dc: 25,
    attribute: 'cha',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'solar-innate-spellcasting',
});
