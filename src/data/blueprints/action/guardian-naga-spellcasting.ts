import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Spellcasting',
  description:
    'The naga is an 11th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 16, +8 to hit with spell attacks), and it needs only verbal components to cast its spells. It has the following cleric spells prepared: Cantrips (at will): mending, sacred flame, thaumaturgy; 1st level (4 slots): command, cure wounds, shield of faith; 2nd level (3 slots): calm emotions, hold person; 3rd level (3 slots): bestow curse, clairvoyance; 4th level (3 slots): banishment, freedom of movement; 5th level (2 slots): flame strike, geas; 6th level (1 slot): true seeing',
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'guardian-naga-spellcasting',
});
