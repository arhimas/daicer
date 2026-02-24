import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Innate Spellcasting',
  description:
    "The pit fiend's spellcasting ability is Charisma (spell save DC 21). The pit fiend can innately cast the following spells, requiring no material components: At will: detect magic, fireball 3/day each: hold monster, wall of fire",
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: {
    dc: 21,
    attribute: 'cha',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'pit-fiend-innate-spellcasting',
});
