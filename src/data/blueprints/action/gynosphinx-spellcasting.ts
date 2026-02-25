import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Spellcasting',
  description:
    'The sphinx is a 9th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 16, +8 to hit with spell attacks). It requires no material components to cast its spells. The sphinx has the following wizard spells prepared: Cantrips (at will): mage hand, minor illusion, prestidigitation; 1st level (4 slots): detect magic, identify, shield; 2nd level (3 slots): darkness, locate object, suggestion; 3rd level (3 slots): dispel magic, remove curse, tongues; 4th level (3 slots): banishment, greater invisibility; 5th level (1 slot): legend lore',
  type: 'ability',
  toHit: 8,
  mechanics_config: {
    action_type: 'None',
  },
  save: {
    dc: 16,
    attribute: 'int',
  },
  slug: 'gynosphinx-spellcasting',
});
