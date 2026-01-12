export const EMBEDDABLE_MODELS = [
  'api::spell.spell',
  'api::race.race',
  'api::class.class',
  'api::subclass.subclass',
  'api::feature.feature',
  'api::trait.trait',
  'api::proficiency.proficiency',
  'api::language.language',
  'api::magic-school.magic-school',
  'api::damage-type.damage-type',
  'api::weapon-property.weapon-property',
  'api::knowledge-source.knowledge-source',
  'api::knowledge-snippet.knowledge-snippet',
  // 'api::item.item', // Maybe? User didn't explicitly ask for items but they are usually rule-heavy.
  // 'api::equipment.equipment', // Maybe?
  // 'api::condition.condition', // If it exists
  // 'api::magic-item.magic-item', // If it exists
];

// Content Types explicitly excluded based on user feedback (Runtime/Instance data)
// 'api::character.character'
// 'api::monster.monster' 
// 'api::entity-sheet.entity-sheet'
// 'api::map-chunk.map-chunk'
// 'api::dm-setting.dm-setting'
// 'api::room.room'
// 'api::turn.turn'
