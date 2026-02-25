import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Innate Spellcasting',
  description:
    "The lamia's innate spellcasting ability is Charisma (spell save DC 13). It can innately cast the following spells, requiring no material components. At will: disguise self (any humanoid form), major image 3/day each: charm person, mirror image, scrying, suggestion 1/day: geas",
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: {
    dc: 13,
    attribute: 'cha',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'lamia-innate-spellcasting',
});
