import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'spellcasting-cleric',
  name: 'Spellcasting: Cleric',
  compilation_state: {
    status: 'Valid',
    summary: 'Cleric spellcasting feature',
  },
  description:
    'As a conduit for divine power, you can cast cleric spells. At 1st level, you know three cantrips of your choice from the cleric spell list. You prepare the list of cleric spells that are available for you to cast, choosing from the cleric spell list. When you do so, choose a number of cleric spells equal to your Wisdom modifier + your cleric level (minimum of one spell). The spells must be of a level for which you have spell slots. Wisdom is your spellcasting ability for your cleric spells, since your power stems from your devotion to your deity. You can cast a cleric spell as a ritual if that spell has the ritual tag and you have the spell prepared. You can use a holy symbol as a spellcasting focus for your cleric spells.',
  level: 1,
  lore: 'As a conduit for divine power, you can cast cleric spells.',
  tags: ['cleric', 'spellcasting'],
});
