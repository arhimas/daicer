import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Innate Spellcasting',
  description:
    "The dryad's innate spellcasting ability is Charisma (spell save DC 14). The dryad can innately cast the following spells, requiring no material components: At will: druidcraft; 3/day each: entangle, goodberry; 1/day each: barkskin, pass without trace, shillelagh",
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: {
    dc: 14,
    attribute: 'cha',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'dryad-innate-spellcasting',
});
