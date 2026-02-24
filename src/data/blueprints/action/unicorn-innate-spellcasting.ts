import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Innate Spellcasting',
  description:
    "The unicorn's innate spellcasting ability is Charisma (spell save DC 14). The unicorn can innately cast the following spells, requiring no components: At will: detect evil and good, druidcraft, pass without trace; 1/day each: calm emotions, dispel evil and good, entangle",
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'unicorn-innate-spellcasting',
});
