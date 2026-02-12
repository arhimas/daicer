import { SeedFeature } from '@/genesis/schemas/molecules';

export const FEATURES: SeedFeature[] = [
  {
    name: 'Spellcasting',
    slug: 'wizard-spellcasting',
    description:
      'As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power.',
    level: 1,
    tags: ['class_wizard'],
  },
  {
    name: 'Spellcasting Focus',
    slug: 'wizard-spellcasting-focus',
    description: 'You can use an arcane focus as a spellcasting focus for your wizard spells.',
    level: 1,
    tags: ['class_wizard'],
  },
  {
    name: 'Spellcasting Ability',
    slug: 'wizard-spellcasting-ability',
    description:
      'Intelligence is your spellcasting ability for your wizard spells, since you learn your spells through dedicated study and memorization. You use your Intelligence whenever a spell refers to your spellcasting ability. In addition, you use your Intelligence modifier when setting the saving throw DC for a wizard spell you cast and when making an attack roll with one.\n\n<table>\n<colgroup>\n<col width="100%" />\n</colgroup>\n<tbody>\n<tr class="odd">\n<td align="center"><strong>Spell save DC</strong> = 8 + your proficiency bonus + your Intelligence modifier</td>\n</tr>\n<tr class="even">\n<td align="center"><strong>Spell attack modifier</strong> = your proficiency bonus + your Intelligence modifier</td>\n</tr>\n</tbody>\n</table>',
    level: 1,
    tags: ['class_wizard'],
  },
  {
    name: 'Spellbook',
    slug: 'wizard-spellbook',
    description:
      'At 1st level, you have a spellbook containing six 1st-level wizard spells of your choice. Your spellbook is the repository of the wizard spells you know, except your cantrips, which are fixed in your mind.',
    level: 1,
    tags: ['class_wizard'],
  },
  {
    name: 'Spell Mastery',
    slug: 'wizard-spell-mastery',
    description:
      'At 18th level, you have achieved such mastery over certain spells that you can cast them at will. Choose a 1st-level wizard spell and a 2nd-level wizard spell that are in your spellbook. You can cast those spells at their lowest level without expending a spell slot when you have them prepared. If you want to cast either spell at a higher level, you must expend a spell slot as normal.\n\nBy spending 8 hours in study, you can exchange one or both of the spells you chose for different spells of the same levels.',
    level: 18,
    tags: ['class_wizard'],
  },
  {
    name: 'Signature Spells',
    slug: 'wizard-signature-spells',
    description:
      "When you reach 20th level, you gain mastery over two powerful spells and can cast them with little effort. Choose two 3rd-level wizard spells in your spellbook as your signature spells. You always have these spells prepared, they don't count against the number of spells you have prepared, and you can cast each of them once at 3rd level without expending a spell slot. When you do so, you can't do so again until you finish a short or long rest.\n\nIf you want to cast either spell at a higher level, you must expend a spell slot as normal.",
    level: 20,
    tags: ['class_wizard'],
  },
  {
    name: 'Ritual Casting',
    slug: 'wizard-ritual-casting',
    description:
      "You can cast a wizard spell as a ritual if that spell has the ritual tag and you have the spell in your spellbook. You don't need to have the spell prepared.",
    level: 1,
    tags: ['class_wizard'],
  },
  {
    name: 'Preparing and Casting Spells',
    slug: 'wizard-preparing-and-casting-spells',
    description:
      '<table style="width:100%;">\n<caption>Wizard Spell Slots per Level</caption>\n<colgroup>\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center" rowspan=2>Wizard Level</th>\n<th align="center" colspan=9>Spell Level</th>\n</tr>\n<tr class="header">\n<th align="center">1st</th>\n<th align="center">2nd</th>\n<th align="center">3rd</th>\n<th align="center">4th</th>\n<th align="center">5th</th>\n<th align="center">6th</th>\n<th align="center">7th</th>\n<th align="center">8th</th>\n<th align="center">9th</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">1st</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">2nd</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">3rd</td>\n<td align="center">4</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">4th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">5th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">6th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">7th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">8th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">9th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">10th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">11th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">12th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">13th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">14th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">15th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">16th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">17th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">18th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="odd">\n<td align="center">19th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">20th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n</tbody>\n</table>\n\nThe Wizard Spell Slots per Level table shows how many spell slots you have to cast your spells of 1st level and higher. To cast one of these spells, you must expend a slot of the spell\'s level or higher. You regain all expended spell slots when you finish a long rest.\n\nYou prepare the list of wizard spells that are available for you to cast. To do so, choose a number of wizard spells from your spellbook equal to your Intelligence modifier + your wizard level (minimum of one spell). The spells must be of a level for which you have spell slots.\n\nFor example, if you\'re a 3rd-level wizard, you have four 1st-level and two 2nd-level spell slots. With an Intelligence of 16, your list of prepared spells can include six spells of 1st or 2nd level, in any combination, chosen from your spellbook. If you prepare the 1st-level spell [_magic missile_](#magic-missile), you can cast it using a 1st-level or a 2nd-level slot. Casting the spell doesn\'t remove it from your list of prepared spells.\n\nYou can change your list of prepared spells when you finish a long rest. Preparing a new list of wizard spells requires time spent studying your spellbook and memorizing the incantations and gestures you must make to cast the spell: at least 1 minute per spell level for each spell on your list.',
    level: 1,
    tags: ['class_wizard'],
  },
  {
    name: 'Learning Spells of 1st Level and Higher',
    slug: 'wizard-learning-spells-of-1st-level-and-higher',
    description:
      'Each time you gain a wizard level, you can add two wizard spells of your choice to your spellbook for free. Each of these spells must be of a level for which you have spell slots, as shown on the Wizard table.\n\nOn your adventures, you might find other spells that you can add to [your spellbook](#your-spellbook).',
    level: 1,
    tags: ['class_wizard'],
  },
  {
    name: 'Cantrips',
    slug: 'wizard-cantrips',
    description:
      'At 1st level, you know three cantrips of your choice from the [wizard spell list](#section-wizard-spells). You learn additional wizard cantrips of your choice at higher levels, as shown in the Cantrips Known column of the Wizard table.',
    level: 1,
    tags: ['class_wizard'],
  },
  {
    name: 'Arcane Tradition',
    slug: 'wizard-arcane-tradition',
    description:
      'When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic through a specific [school](#section-arcane-traditions).\n\nYour choice grants you features at 2nd level and again at 6th, 10th, and 14th level.',
    level: 2,
    tags: ['class_wizard'],
  },
  {
    name: 'Arcane Recovery',
    slug: 'wizard-arcane-recovery',
    description:
      "You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher.\n\nFor example, if you're a 4th-level wizard, you can recover up to two levels worth of spell slots. You can recover either a 2nd-level spell slot or two 1st-level spell slots.",
    level: 1,
    tags: ['class_wizard'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'wizard-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_wizard'],
  },
  {
    name: 'Spells Known of 1st Level and Higher',
    slug: 'warlock-spells-known-of-1st-level-and-higher',
    description:
      "At 1st level, you know two 1st-level spells of your choice from the [warlock spell list](#section-warlock-spells).\n\nThe Spells Known column of the Warlock table shows when you learn more warlock spells of your choice of 1st level and higher. A spell you choose must be of a level no higher than what's shown in the Warlock Spell Slots by Level table's Slot Level column for your level. When you reach 6th level, for example, you learn a new warlock spell, which can be 1st, 2nd, or 3rd level.\n\nAdditionally, when you gain a level in this class, you can choose one of the warlock spells you know and replace it with another spell from the warlock spell list, which also must be of a level for which you have spell slots.",
    level: 1,
    tags: ['class_warlock'],
  },
  {
    name: 'Spellcasting Focus',
    slug: 'warlock-spellcasting-focus',
    description: 'You can use an arcane focus as a spellcasting focus for your warlock spells.',
    level: 1,
    tags: ['class_warlock'],
  },
  {
    name: 'Spellcasting Ability',
    slug: 'warlock-spellcasting-ability',
    description:
      'Charisma is your spellcasting ability for your warlock spells, so you use your Charisma whenever a spell refers to your spellcasting ability. In addition, you use your Charisma modifier when setting the saving throw DC for a warlock spell you cast and when making an attack roll with one.\n\n<table>\n<colgroup>\n<col width="100%" />\n</colgroup>\n<tbody>\n<tr class="odd">\n<td align="center"><strong>Spell save DC</strong> = 8 + your proficiency bonus + your Charisma modifier</td>\n</tr>\n<tr class="even">\n<td align="center"><strong>Spell attack modifier</strong> = your proficiency bonus + your Charisma modifier</td>\n</tr>\n</tbody>\n</table>',
    level: 1,
    tags: ['class_warlock'],
  },
  {
    name: 'Spell Slots',
    slug: 'warlock-spell-slots',
    description:
      '<table style="width:61%;">\n<caption>Warlock Spell Slots by Level</caption>\n<colgroup>\n<col width="22%" />\n<col width="19%" />\n<col width="19%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center">Warlock Level</th>\n<th align="center">Spell Slots</th>\n<th align="center">Slot Level</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">1st</td>\n<td align="center">1</td>\n<td align="center">1st</td>\n</tr>\n<tr class="even">\n<td align="center">2nd</td>\n<td align="center">2</td>\n<td align="center">1st</td>\n</tr>\n<tr class="odd">\n<td align="center">3rd</td>\n<td align="center">2</td>\n<td align="center">2nd</td>\n</tr>\n<tr class="even">\n<td align="center">4th</td>\n<td align="center">2</td>\n<td align="center">2nd</td>\n</tr>\n<tr class="odd">\n<td align="center">5th</td>\n<td align="center">2</td>\n<td align="center">3rd</td>\n</tr>\n<tr class="even">\n<td align="center">6th</td>\n<td align="center">2</td>\n<td align="center">3rd</td>\n</tr>\n<tr class="odd">\n<td align="center">7th</td>\n<td align="center">2</td>\n<td align="center">4th</td>\n</tr>\n<tr class="even">\n<td align="center">8th</td>\n<td align="center">2</td>\n<td align="center">4th</td>\n</tr>\n<tr class="odd">\n<td align="center">9th</td>\n<td align="center">2</td>\n<td align="center">5th</td>\n</tr>\n<tr class="even">\n<td align="center">10th</td>\n<td align="center">2</td>\n<td align="center">5th</td>\n</tr>\n<tr class="odd">\n<td align="center">11th</td>\n<td align="center">3</td>\n<td align="center">5th</td>\n</tr>\n<tr class="even">\n<td align="center">12th</td>\n<td align="center">3</td>\n<td align="center">5th</td>\n</tr>\n<tr class="odd">\n<td align="center">13th</td>\n<td align="center">3</td>\n<td align="center">5th</td>\n</tr>\n<tr class="even">\n<td align="center">14th</td>\n<td align="center">3</td>\n<td align="center">5th</td>\n</tr>\n<tr class="odd">\n<td align="center">15th</td>\n<td align="center">3</td>\n<td align="center">5th</td>\n</tr>\n<tr class="even">\n<td align="center">16th</td>\n<td align="center">3</td>\n<td align="center">5th</td>\n</tr>\n<tr class="odd">\n<td align="center">17th</td>\n<td align="center">4</td>\n<td align="center">5th</td>\n</tr>\n<tr class="even">\n<td align="center">18th</td>\n<td align="center">4</td>\n<td align="center">5th</td>\n</tr>\n<tr class="odd">\n<td align="center">19th</td>\n<td align="center">4</td>\n<td align="center">5th</td>\n</tr>\n<tr class="even">\n<td align="center">20th</td>\n<td align="center">4</td>\n<td align="center">5th</td>\n</tr>\n</tbody>\n</table>\n\nThe Warlock Spell Slots by Level table shows how many spell slots you have. The table also shows what the level of those slots is; all of your spell slots are the same level. To cast one of your warlock spells of 1st level or higher, you must expend a spell slot. You regain all expended spell slots when you finish a short or long rest.\n\nFor example, when you are 5th level, you have two 3rd-level spell slots. To cast the 1st-level spell [_thunderwave_](#thunderwave), you must spend one of those slots, and you cast it as a 3rd-level spell.',
    level: 1,
    tags: ['class_warlock'],
  },
  {
    name: 'Pact of the Tome',
    slug: 'warlock-pact-of-the-tome',
    description:
      "Your patron gives you a grimoire called a Book of Shadows. When you gain this feature, choose three cantrips from any class's spell list (the three needn't be from the same list). While the book is on your person, you can cast those cantrips at will. They don't count against your number of cantrips known. If they don't appear on the [warlock spell list](#section-warlock-spells), they are nonetheless warlock spells for you.\n\nIf you lose your Book of Shadows, you can perform a 1-hour ceremony to receive a replacement from your patron. This ceremony can be performed during a short or long rest, and it destroys the previous book. The book turns to ash when you die.",
    level: 1,
    tags: ['class_warlock'],
  },
  {
    name: 'Pact of the Chain',
    slug: 'warlock-pact-of-the-chain',
    description:
      "You learn the [_find familiar_](#find-familiar) spell and can cast it as a ritual. The spell doesn't count against your number of spells known.\n\nWhen you cast the spell, you can choose one of the normal forms for your familiar or one of the following special forms: imp, pseudodragon, quasit, or sprite.\n\nAdditionally, when you take the Attack action, you can forgo one of your own attacks to allow your familiar to make one attack of its own with its reaction.",
    level: 1,
    tags: ['class_warlock'],
  },
  {
    name: 'Pact of the Blade',
    slug: 'warlock-pact-of-the-blade',
    description:
      "You can use your action to create a pact weapon in your empty hand. You can choose the form that this melee weapon takes each time you create it. You are proficient with it while you wield it. This weapon counts as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.\n\nYour pact weapon disappears if it is more than 5 feet away from you for 1 minute or more. It also disappears if you use this feature again, if you dismiss the weapon (no action required), or if you die.\n\nYou can transform one magic weapon into your pact weapon by performing a special ritual while you hold the weapon. You perform the ritual over the course of 1 hour, which can be done during a short rest. You can then dismiss the weapon, shunting it into an extradimensional space, and it appears whenever you create your pact weapon thereafter. You can't affect an artifact or a sentient weapon in this way. The weapon ceases being your pact weapon if you die, if you perform the 1-hour ritual on a different weapon, or if you use a 1-hour ritual to break your bond to it. The weapon appears at your feet if it is in the extradimensional space when the bond breaks.",
    level: 1,
    tags: ['class_warlock'],
  },
  {
    name: 'Pact Magic',
    slug: 'warlock-pact-magic',
    description:
      'Your arcane research and the magic bestowed on you by your patron have given you facility with spells.',
    level: 1,
    tags: ['class_warlock'],
  },
  {
    name: 'Pact Boon',
    slug: 'warlock-pact-boon',
    description:
      'At 3rd level, your otherworldly patron bestows a gift upon you for your loyal service. You gain one of the following features of your choice.',
    level: 3,
    tags: ['class_warlock'],
  },
  {
    name: 'Otherworldly Patron',
    slug: 'warlock-otherworldly-patron',
    description:
      'At 1st level, you have struck a bargain with an otherworldly being of your choice, such as the Fiend. Your choice grants you features at 1st level and again at 6th, 10th, and 14th level.',
    level: 1,
    tags: ['class_warlock'],
  },
  {
    name: 'Mystic Arcanum',
    slug: 'warlock-mystic-arcanum',
    description:
      'At 11th level, your patron bestows upon you a magical secret called an arcanum. Choose one 6th-level spell from the [warlock spell list](#section-warlock-spells) as this arcanum.\n\nYou can cast your arcanum spell once without expending a spell slot. You must finish a long rest before you can do so again.\n\nAt higher levels, you gain more warlock spells of your choice that can be cast in this way: one 7th-level spell at 13th level, one 8th-level spell at 15th level, and one 9th-level spell at 17th level. You regain all uses of your Mystic Arcanum when you finish a long rest.',
    level: 11,
    tags: ['class_warlock'],
  },
  {
    name: 'Eldritch Master',
    slug: 'warlock-eldritch-master',
    description:
      'At 20th level, you can draw on your inner reserve of mystical power while entreating your patron to regain expended spell slots. You can spend 1 minute entreating your patron for aid to regain all your expended spell slots from your Pact Magic feature. Once you regain spell slots with this feature, you must finish a long rest before you can do so again.',
    level: 20,
    tags: ['class_warlock'],
  },
  {
    name: 'Eldritch Invocations',
    slug: 'warlock-eldritch-invocations',
    description:
      'In your study of occult lore, you have unearthed [eldritch invocations](#section-eldritch-invocations), fragments of forbidden knowledge that imbue you with an abiding magical ability.\n\nAt 2nd level, you gain two eldritch invocations of your choice. When you gain certain warlock levels, you gain additional invocations of your choice, as shown in the Invocations Known column of the Warlock table.\n\nAdditionally, when you gain a level in this class, you can choose one of the invocations you know and replace it with another invocation that you could learn at that level.',
    level: 2,
    tags: ['class_warlock'],
  },
  {
    name: 'Cantrips',
    slug: 'warlock-cantrips',
    description:
      'You know two cantrips of your choice from the [warlock spell list](#section-warlock-spells). You learn additional warlock cantrips of your choice at higher levels, as shown in the Cantrips Known column of the Warlock table.',
    level: 1,
    tags: ['class_warlock'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'warlock-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_warlock'],
  },
  {
    name: 'Twinned Spell',
    slug: 'sorcerer-twinned-spell',
    description:
      "When you cast a spell that targets only one creature and doesn't have a range of self, you can spend a number of sorcery points equal to the spell's level to target a second creature in range with the same spell (1 sorcery point if the spell is a cantrip).\n\nTo be eligible, a spell must be incapable of targeting more than one creature at the spell's current level. For example, [_magic missile_](#magic-missile) and [_scorching ray_](#scorching-ray) aren't eligible, but [_ray of frost_](#ray-of-frost) and [_finger of death_](#finger-of-death) are.",
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Subtle Spell',
    slug: 'sorcerer-subtle-spell',
    description:
      'When you cast a spell, you can spend 1 sorcery point to cast it without any somatic or verbal components.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Spells Known of 1st Level and Higher',
    slug: 'sorcerer-spells-known-of-1st-level-and-higher',
    description:
      'You know two 1st-level spells of your choice from the [sorcerer spell list](#section-sorcerer-spells).\n\nThe Spells Known column of the Sorcerer table shows when you learn more sorcerer spells of your choice. Each of these spells must be of a level for which you have spell slots. For instance, when you reach 3rd level in this class, you can learn one new spell of 1st or 2nd level.\n\nAdditionally, when you gain a level in this class, you can choose one of the sorcerer spells you know and replace it with another spell from the sorcerer spell list, which also must be of a level for which you have spell slots.',
    level: 3,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Spellcasting',
    slug: 'sorcerer-spellcasting',
    description:
      'An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic. This font of magic, whatever its origin, fuels your spells.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Spellcasting Focus',
    slug: 'sorcerer-spellcasting-focus',
    description: 'You can use an arcane focus as a spellcasting focus for your sorcerer spells.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Spellcasting Ability',
    slug: 'sorcerer-spellcasting-ability',
    description:
      'Charisma is your spellcasting ability for your sorcerer spells, since the power of your magic relies on your ability to project your will into the world. You use your Charisma whenever a spell refers to your spellcasting ability. In addition, you use your Charisma modifier when setting the saving throw DC for a sorcerer spell you cast and when making an attack roll with one.\n\n<table>\n<colgroup>\n<col width="100%" />\n</colgroup>\n<tbody>\n<tr class="odd">\n<td align="center"><strong>Spell save DC</strong> = 8 + your proficiency bonus + your Charisma modifier</td>\n</tr>\n<tr class="even">\n<td align="center"><strong>Spell attack modifier</strong> = your proficiency bonus + your Charisma modifier</td>\n</tr>\n</tbody>\n</table>',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Spell Slots',
    slug: 'sorcerer-spell-slots',
    description:
      '<table style="width:100%;">\n<caption>Sorcerer Spell Slots per Level</caption>\n<colgroup>\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center" rowspan=2>Sorcerer Level</th>\n<th align="center" colspan=9>Spell Level</th>\n</tr>\n<tr class="header">\n<th align="center">1st</th>\n<th align="center">2nd</th>\n<th align="center">3rd</th>\n<th align="center">4th</th>\n<th align="center">5th</th>\n<th align="center">6th</th>\n<th align="center">7th</th>\n<th align="center">8th</th>\n<th align="center">9th</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">1st</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">2nd</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">3rd</td>\n<td align="center">4</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">4th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">5th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">6th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">7th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">8th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">9th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">10th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">11th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">12th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">13th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">14th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">15th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">16th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">17th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">18th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="odd">\n<td align="center">19th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">20th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n</tbody>\n</table>\n\nThe Sorcerer Spell Slots per Level table shows how many spell slots you have to cast your spells of 1st level and higher. To cast one of these sorcerer spells, you must expend a slot of the spell\'s level or higher. You regain all expended spell slots when you finish a long rest.\n\nFor example, if you know the 1st-level spell [_burning hands_](#burning-hands) and have a 1st-level and a 2nd-level spell slot available, you can cast [_burning hands_](#burning-hands) using either slot.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Sorcery Points',
    slug: 'sorcerer-sorcery-points',
    description:
      'You have 2 sorcery points, and you gain more as you reach higher levels, as shown in the Sorcery Points column of the Sorcerer table. You can never have more sorcery points than shown on the table for your level. You regain all spent sorcery points when you finish a long rest.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Sorcerous Restoration',
    slug: 'sorcerer-sorcerous-restoration',
    description: 'At 20th level, you regain 4 expended sorcery points whenever you finish a short rest.',
    level: 20,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Sorcerous Origin',
    slug: 'sorcerer-sorcerous-origin',
    description:
      'Choose a [sorcerous origin](#section-sorcerous-origins), which describes the source of your innate magical power.\n\nYour choice grants you features when you choose it at 1st level and again at 6th, 14th, and 18th level.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Quickened Spell',
    slug: 'sorcerer-quickened-spell',
    description:
      'When you cast a spell that has a casting time of 1 action, you can spend 2 sorcery points to change the casting time to 1 bonus action for this casting.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Metamagic',
    slug: 'sorcerer-metamagic',
    description:
      'At 3rd level, you gain the ability to twist your spells to suit your needs. You gain two of the following Metamagic options of your choice. You gain another one at 10th and 17th level.\n\nYou can use only one Metamagic option on a spell when you cast it, unless otherwise noted.',
    level: 3,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Heightened Spell',
    slug: 'sorcerer-heightened-spell',
    description:
      'When you cast a spell that forces a creature to make a saving throw to resist its effects, you can spend 3 sorcery points to give one target of the spell disadvantage on its first saving throw made against the spell.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Font of Magic',
    slug: 'sorcerer-font-of-magic',
    description:
      'At 2nd level, you tap into a deep wellspring of magic within yourself. This wellspring is represented by sorcery points, which allow you to create a variety of magical effects.',
    level: 2,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Flexible Casting',
    slug: 'sorcerer-flexible-casting',
    description:
      'You can use your sorcery points to gain additional spell slots, or sacrifice spell slots to gain additional sorcery points. You learn other ways to use your sorcery points as you reach higher levels.\n\n**_Creating Spell Slots._** You can transform unexpended sorcery points into one spell slot as a bonus action on your turn. The Creating Spell Slots table shows the cost of creating a spell slot of a given level. You can create spell slots no higher in level than 5th.\n\nAny spell slot you create with this feature vanishes when you finish a long rest.\n\n<table style="width:39%;">\n<caption>Creating Spell Slots</caption>\n<colgroup>\n<col width="18%" />\n<col width="20%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center">Spell Slot Level</th>\n<th align="center">Sorcery Point Cost</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">1st</td>\n<td align="center">2</td>\n</tr>\n<tr class="even">\n<td align="center">2nd</td>\n<td align="center">3</td>\n</tr>\n<tr class="odd">\n<td align="center">3rd</td>\n<td align="center">5</td>\n</tr>\n<tr class="even">\n<td align="center">4th</td>\n<td align="center">6</td>\n</tr>\n<tr class="odd">\n<td align="center">5th</td>\n<td align="center">7</td>\n</tr>\n</tbody>\n</table>\n\n**_Converting a Spell Slot to Sorcery Points._** As a bonus action on your turn, you can expend one spell slot and gain a number of sorcery points equal to the slot\'s level.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Extended Spell',
    slug: 'sorcerer-extended-spell',
    description:
      'When you cast a spell that has a duration of 1 minute or longer, you can spend 1 sorcery point to double its duration, to a maximum duration of 24 hours.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Empowered Spell',
    slug: 'sorcerer-empowered-spell',
    description:
      'When you roll damage for a spell, you can spend 1 sorcery point to reroll a number of the damage dice up to your Charisma modifier (minimum of one). You must use the new rolls.\n\nYou can use Empowered Spell even if you have already used a different Metamagic option during the casting of the spell.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Distant Spell',
    slug: 'sorcerer-distant-spell',
    description:
      'When you cast a spell that has a range of 5 feet or greater, you can spend 1 sorcery point to double the range of the spell.\n\nWhen you cast a spell that has a range of touch, you can spend 1 sorcery point to make the range of the spell 30 feet.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Careful Spell',
    slug: 'sorcerer-careful-spell',
    description:
      "When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell's full force. To do so, you spend 1 sorcery point and choose a number of those creatures up to your Charisma modifier (minimum of one creature). A chosen creature automatically succeeds on its saving throw against the spell.",
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Cantrips',
    slug: 'sorcerer-cantrips',
    description:
      'At 1st level, you know four cantrips of your choice from the [sorcerer spell list](#section-sorcerer-spells). You learn additional sorcerer cantrips of your choice at higher levels, as shown in the Cantrips Known column of the Sorcerer table.',
    level: 1,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'sorcerer-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_sorcerer'],
  },
  {
    name: 'Uncanny Dodge',
    slug: 'rogue-uncanny-dodge',
    description:
      "Starting at 5th level, when an attacker that you can see hits you with an attack, you can use your reaction to halve the attack's damage against you.",
    level: 5,
    tags: ['class_rogue'],
  },
  {
    name: "Thieves' Cant",
    slug: 'rogue-thieves-cant',
    description:
      "During your rogue training you learned thieves' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation. Only another creature that knows thieves' cant understands such messages. It takes four times longer to convey such a message than it does to speak the same idea plainly.\n\nIn addition, you understand a set of secret signs and symbols used to convey short, simple messages, such as whether an area is dangerous or the territory of a thieves' guild, whether loot is nearby, or whether the people in an area are easy marks or will provide a safe house for thieves on the run.",
    level: 1,
    tags: ['class_rogue'],
  },
  {
    name: 'Stroke of Luck',
    slug: 'rogue-stroke-of-luck',
    description:
      "At 20th level, you have an uncanny knack for succeeding when you need to. If your attack misses a target within range, you can turn the miss into a hit. Alternatively, if you fail an ability check, you can treat the d20 roll as a 20.\n\nOnce you use this feature, you can't use it again until you finish a short or long rest.",
    level: 20,
    tags: ['class_rogue'],
  },
  {
    name: 'Sneak Attack',
    slug: 'rogue-sneak-attack',
    description:
      "Beginning at 1st level, you know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or a ranged weapon.\n\nYou don't need advantage on the attack roll if another enemy of the target is within 5 feet of it, that enemy isn't [incapacitated](#incapacitated), and you don't have disadvantage on the attack roll.\n\nThe amount of the extra damage increases as you gain levels in this class, as shown in the Sneak Attack column of the Rogue table.",
    level: 1,
    tags: ['class_rogue'],
  },
  {
    name: 'Slippery Mind',
    slug: 'rogue-slippery-mind',
    description:
      'By 15th level, you have acquired greater mental strength. You gain proficiency in Wisdom saving throws.',
    level: 1,
    tags: ['class_rogue'],
  },
  {
    name: 'Roguish Archetype',
    slug: 'rogue-roguish-archetype',
    description:
      'At 3rd level, you choose an [archetype](#section-roguish-archetypes) that you emulate in the exercise of your rogue abilities. Your archetype choice grants you features at 3rd level and then again at 9th, 13th, and 17th level.',
    level: 3,
    tags: ['class_rogue'],
  },
  {
    name: 'Reliable Talent',
    slug: 'rogue-reliable-talent',
    description:
      'By 11th level, you have refined your chosen skills until they approach perfection. Whenever you make an ability check that lets you add your proficiency bonus, you can treat a d20 roll of 9 or lower as a 10.',
    level: 1,
    tags: ['class_rogue'],
  },
  {
    name: 'Expertise',
    slug: 'rogue-expertise',
    description:
      "At 1st level, choose two of your skill proficiencies, or one of your skill proficiencies and your proficiency with thieves' tools. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.\n\nAt 6th level, you can choose two more of your proficiencies (in skills or with thieves' tools) to gain this benefit.",
    level: 1,
    tags: ['class_rogue'],
  },
  {
    name: 'Evasion',
    slug: 'rogue-evasion',
    description:
      "Beginning at 7th level, you can nimbly dodge out of the way of certain area effects, such as a red dragon's fiery breath or an [_ice storm_](#ice-storm) spell. When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.",
    level: 7,
    tags: ['class_rogue'],
  },
  {
    name: 'Elusive',
    slug: 'rogue-elusive',
    description:
      "Beginning at 18th level, you are so evasive that attackers rarely gain the upper hand against you. No attack roll has advantage against you while you aren't [incapacitated](#incapacitated).",
    level: 18,
    tags: ['class_rogue'],
  },
  {
    name: 'Cunning Action',
    slug: 'rogue-cunning-action',
    description:
      'Starting at 2nd level, your quick thinking and agility allow you to move and act quickly. You can take a bonus action on each of your turns in combat. This action can be used only to take the Dash, Disengage, or Hide action.',
    level: 2,
    tags: ['class_rogue'],
  },
  {
    name: 'Blindsense',
    slug: 'rogue-blindsense',
    description:
      'Starting at 14th level, if you are able to hear, you are aware of the location of any hidden or [invisible](#invisible) creature within 10 feet of you.',
    level: 14,
    tags: ['class_rogue'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'rogue-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 10th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_rogue'],
  },
  {
    name: 'Vanish',
    slug: 'ranger-vanish',
    description:
      "Starting at 14th level, you can use the Hide action as a bonus action on your turn. Also, you can't be tracked by nonmagical means, unless you choose to leave a trail.",
    level: 14,
    tags: ['class_ranger'],
  },
  {
    name: 'Two-Weapon Fighting',
    slug: 'ranger-two-weapon-fighting',
    description:
      'When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack.',
    level: 1,
    tags: ['class_ranger'],
  },
  {
    name: 'Spells Known of 1st Level and Higher',
    slug: 'ranger-spells-known-of-1st-level-and-higher',
    description:
      'You know two 1st-level spells of your choice from the [ranger spell list](#section-ranger-spells).\n\nThe Spells Known column of the Ranger table shows when you learn more ranger spells of your choice. Each of these spells must be of a level for which you have spell slots. For instance, when you reach 5th level in this class, you can learn one new spell of 1st or 2nd level.\n\nAdditionally, when you gain a level in this class, you can choose one of the ranger spells you know and replace it with another spell from the ranger spell list, which also must be of a level for which you have spell slots.',
    level: 5,
    tags: ['class_ranger'],
  },
  {
    name: 'Spellcasting',
    slug: 'ranger-spellcasting',
    description:
      'By the time you reach 2nd level, you have learned to use the magical essence of nature to cast spells, much as a druid does. See "[Spellcasting](#chapter-spellcasting)" and the [ranger spell list](#section-ranger-spells).',
    level: 1,
    tags: ['class_ranger'],
  },
  {
    name: 'Spellcasting Ability',
    slug: 'ranger-spellcasting-ability',
    description:
      'Wisdom is your spellcasting ability for your ranger spells, since your magic draws on your attunement to nature. You use your Wisdom whenever a spell refers to your spellcasting ability. In addition, you use your Wisdom modifier when setting the saving throw DC for a ranger spell you cast and when making an attack roll with one.\n\n<table>\n<colgroup>\n<col width="100%" />\n</colgroup>\n<tbody>\n<tr class="odd">\n<td align="center"><strong>Spell save DC</strong> = 8 + your proficiency bonus + your Wisdom modifier</td>\n</tr>\n<tr class="even">\n<td align="center"><strong>Spell attack modifier</strong> = your proficiency bonus + your Wisdom modifier</td>\n</tr>\n</tbody>\n</table>',
    level: 1,
    tags: ['class_ranger'],
  },
  {
    name: 'Spell Slots',
    slug: 'ranger-spell-slots',
    description:
      '<table style="width:92%;">\n<caption>Ranger Spell Slots per Level</caption>\n<colgroup>\n<col width="12%" />\n<col width="13%" />\n<col width="13%" />\n<col width="13%" />\n<col width="13%" />\n<col width="13%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center" rowspan=2>Ranger Level</th>\n<th align="center" colspan=5>Spell Level</th>\n</tr>\n<tr class="header">\n<th align="center">1st</th>\n<th align="center">2nd</th>\n<th align="center">3rd</th>\n<th align="center">4th</th>\n<th align="center">5th</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">1st</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">2nd</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">3rd</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">4th</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">5th</td>\n<td align="center">4</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">6th</td>\n<td align="center">4</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">7th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">8th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">9th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">10th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">11th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">12th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">13th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">14th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">15th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">16th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">17th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">18th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n</tr>\n<tr class="odd">\n<td align="center">19th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n</tr>\n<tr class="even">\n<td align="center">20th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n</tr>\n</tbody>\n</table>\n\nThe Ranger Spell Slots by Level table shows how many spell slots you have to cast your spells of 1st level and higher. To cast one of these spells, you must expend a slot of the spell\'s level or higher. You regain all expended spell slots when you finish a long rest.\n\nFor example, if you know the 1st-level spell [_speak with animals_](#speak-with-animals) and have a 1st-level and a 2nd-level spell slot available, you can cast [_speak with animals_](#speak-with-animals) using either slot.',
    level: 1,
    tags: ['class_ranger'],
  },
  {
    name: 'Ranger Archetype',
    slug: 'ranger-ranger-archetype',
    description:
      'At 3rd level, you choose an [archetype](#section-ranger-archetypes) that you strive to emulate. Your choice grants you features at 3rd level and again at 7th, 11th, and 15th level.',
    level: 3,
    tags: ['class_ranger'],
  },
  {
    name: 'Primeval Awareness',
    slug: 'ranger-primeval-awareness',
    description:
      "Beginning at 3rd level, you can use your action and expend one ranger spell slot to focus your awareness on the region around you. For 1 minute per level of the spell slot you expend, you can sense whether the following types of creatures are present within 1 mile of you (or within up to 6 miles if you are in your favored terrain): aberrations, celestials, dragons, elementals, fey, fiends, and undead. This feature doesn't reveal the creatures' location or number.",
    level: 3,
    tags: ['class_ranger'],
  },
  {
    name: 'Natural Explorer',
    slug: 'ranger-natural-explorer',
    description:
      "You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, or swamp. When you make an Intelligence or Wisdom check related to your favored terrain, your proficiency bonus is doubled if you are using a skill that you're proficient in.\n\nWhile traveling for an hour or more in your favored terrain, you gain the following benefits:\n\n- Difficult terrain doesn't slow your group's travel.\n- Your group can't become lost except by magical means.\n- Even when you are engaged in another activity while traveling (such as foraging, navigating, or tracking), you remain alert to danger.\n- If you are traveling alone, you can move stealthily at a normal pace.\n- When you forage, you find twice as much food as you normally would.\n- While tracking other creatures, you also learn their exact number, their sizes, and how long ago they passed through the area.\n\nYou choose additional favored terrain types at 6th and 10th level.",
    level: 1,
    tags: ['class_ranger'],
  },
  {
    name: "Land's Stride",
    slug: 'ranger-land-s-stride',
    description:
      'Starting at 8th level, moving through nonmagical difficult terrain costs you no extra movement. You can also pass through nonmagical plants without being slowed by them and without taking damage from them if they have thorns, spines, or a similar hazard.\n\nIn addition, you have advantage on saving throws against plants that are magically created or manipulated to impede movement, such those created by the [_entangle_](#entangle) spell.',
    level: 8,
    tags: ['class_ranger'],
  },
  {
    name: 'Hide in Plain Sight',
    slug: 'ranger-hide-in-plain-sight',
    description:
      'Starting at 10th level, you can spend 1 minute creating camouflage for yourself. You must have access to fresh mud, dirt, plants, soot, and other naturally occurring materials with which to create your camouflage.\n\nOnce you are camouflaged in this way, you can try to hide by pressing yourself up against a solid surface, such as a tree or wall, that is at least as tall and wide as you are. You gain a +10 bonus to Dexterity (Stealth) checks as long as you remain there without moving or taking actions. Once you move or take an action or a reaction, you must camouflage yourself again to gain this benefit.',
    level: 10,
    tags: ['class_ranger'],
  },
  {
    name: 'Foe Slayer',
    slug: 'ranger-foe-slayer',
    description:
      'At 20th level, you become an unparalleled hunter of your enemies. Once on each of your turns, you can add your Wisdom modifier to the attack roll or the damage roll of an attack you make against one of your favored enemies. You can choose to use this feature before or after the roll, but before any effects of the roll are applied.',
    level: 20,
    tags: ['class_ranger'],
  },
  {
    name: 'Fighting Style',
    slug: 'ranger-fighting-style',
    description:
      "At 2nd level, you adopt a particular style of fighting as your specialty. Choose one of the following options. You can't take a Fighting Style option more than once, even if you later get to choose again.",
    level: 2,
    tags: ['class_ranger'],
  },
  {
    name: 'Feral Senses',
    slug: 'ranger-feral-senses',
    description:
      "At 18th level, you gain preternatural senses that help you fight creatures you can't see. When you attack a creature you can't see, your inability to see it doesn't impose disadvantage on your attack rolls against it. You are also aware of the location of any [invisible](#invisible) creature within 30 feet of you, provided that the creature isn't hidden from you and you aren't [blinded](#blinded) or [deafened](#deafened).",
    level: 18,
    tags: ['class_ranger'],
  },
  {
    name: 'Favored Enemy',
    slug: 'ranger-favored-enemy',
    description:
      'Beginning at 1st level, you have significant experience studying, tracking, hunting, and even talking to a certain type of enemy.\n\nChoose a type of favored enemy: aberrations, beasts, celestials, constructs, dragons, elementals, fey, fiends, giants, monstrosities, oozes, plants, or undead. Alternatively, you can select two races of humanoid (such as gnolls and orcs) as favored enemies.\n\nYou have advantage on Wisdom (Survival) checks to track your favored enemies, as well as on Intelligence checks to recall information about them.\n\nWhen you gain this feature, you also learn one language of your choice that is spoken by your favored enemies, if they speak one at all.\n\nYou choose one additional favored enemy, as well as an associated language, at 6th and 14th level. As you gain levels, your choices should reflect the types of monsters you have encountered on your adventures.',
    level: 1,
    tags: ['class_ranger'],
  },
  {
    name: 'Extra Attack',
    slug: 'ranger-extra-attack',
    description:
      'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.',
    level: 5,
    tags: ['class_ranger'],
  },
  {
    name: 'Dueling',
    slug: 'ranger-dueling',
    description:
      'When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.',
    level: 1,
    tags: ['class_ranger'],
  },
  {
    name: 'Defense',
    slug: 'ranger-defense',
    description: 'While you are wearing armor, you gain a +1 bonus to AC.',
    level: 1,
    tags: ['class_ranger'],
  },
  {
    name: 'Archery',
    slug: 'ranger-archery',
    description: 'You gain a +2 bonus to attack rolls you make with ranged weapons.',
    level: 1,
    tags: ['class_ranger'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'ranger-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_ranger'],
  },
  {
    name: 'Spellcasting',
    slug: 'paladin-spellcasting',
    description:
      'By 2nd level, you have learned to draw on divine magic through meditation and prayer to cast spells as a cleric does.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Spellcasting Focus',
    slug: 'paladin-spellcasting-focus',
    description: 'You can use a holy symbol as a spellcasting focus for your paladin spells.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Spellcasting Ability',
    slug: 'paladin-spellcasting-ability',
    description:
      'Charisma is your spellcasting ability for your paladin spells, since their power derives from the strength of your convictions. You use your Charisma whenever a spell refers to your spellcasting ability. In addition, you use your Charisma modifier when setting the saving throw DC for a paladin spell you cast and when making an attack roll with one.\n\n<table>\n<colgroup>\n<col width="100%" />\n</colgroup>\n<tbody>\n<tr class="odd">\n<td align="center"><strong>Spell save DC</strong> = 8 + your proficiency bonus + your Charisma modifier</td>\n</tr>\n<tr class="even">\n<td align="center"><strong>Spell attack modifier</strong> = your proficiency bonus + your Charisma modifier</td>\n</tr>\n</tbody>\n</table>',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Sacred Oath',
    slug: 'paladin-sacred-oath',
    description:
      'When you reach 3rd level, you swear the [sacred oath](#section-sacred-oaths) that binds you as a paladin forever. Up to this time you have been in a preparatory stage, committed to the path but not yet sworn to it. Now you choose a sacred oath.\n\nYour choice grants you features at 3rd level and again at 7th, 15th, and 20th level. Those features include oath spells and the Channel Divinity feature.',
    level: 3,
    tags: ['class_paladin'],
  },
  {
    name: 'Protection',
    slug: 'paladin-protection',
    description:
      'When a creature you can see attacks a target other than you that is within 5 feet of you, you can use your reaction to impose disadvantage on the attack roll. You must be wielding a shield.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Preparing and Casting Spells',
    slug: 'paladin-preparing-and-casting-spells',
    description:
      '<table style="width:93%;">\n<caption>Paladin Spell Slots per Level</caption>\n<colgroup>\n<col width="20%" />\n<col width="16%" />\n<col width="16%" />\n<col width="16%" />\n<col width="16%" />\n<col width="16%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center" rowspan=2>Paladin Level</th>\n<th align="center" colspan=5>Spell Level</th>\n</tr>\n<tr class="header">\n<th align="center">1st</th>\n<th align="center">2nd</th>\n<th align="center">3rd</th>\n<th align="center">4th</th>\n<th align="center">5th</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">1st</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">2nd</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">3rd</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">4th</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">5th</td>\n<td align="center">4</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">6th</td>\n<td align="center">4</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">7th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">8th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">9th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">10th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">11th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">12th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">13th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">14th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">15th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">16th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">17th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">18th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n</tr>\n<tr class="odd">\n<td align="center">19th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n</tr>\n<tr class="even">\n<td align="center">20th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n</tr>\n</tbody>\n</table>\n\nThe Paladin Spell Slots by Level table shows how many spell slots you have to cast your spells. To cast one of your paladin spells of 1st level or higher, you must expend a slot of the spell\'s level or higher. You regain all expended spell slots when you finish a long rest.\n\nYou prepare the list of paladin spells that are available for you to cast, choosing from the [paladin spell list](#section-paladin-spells). When you do so, choose a number of paladin spells equal to your Charisma modifier + half your paladin level, rounded down (minimum of one spell). The spells must be of a level for which you have spell slots.\n\nFor example, if you are a 5th-level paladin, you have four 1st-level and two 2nd-level spell slots.\n\nWith a Charisma of 14, your list of prepared spells can include four spells of 1st or 2nd level, in any combination. If you prepare the 1st-level spell [_cure wounds_](#cure-wounds), you can cast it using a 1st-level or a 2nd-level slot. Casting the spell doesn\'t remove it from your list of prepared spells.\n\nYou can change your list of prepared spells when you finish a long rest. Preparing a new list of paladin spells requires time spent in prayer and meditation: at least 1 minute per spell level for each spell on your list.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Oath Spells',
    slug: 'paladin-oath-spells',
    description:
      "Each oath has a list of associated spells. You gain access to these spells at the levels specified in the oath description. Once you gain access to an oath spell, you always have it prepared. Oath spells don't count against the number of spells you can prepare each day.\n\nIf you gain an oath spell that doesn't appear on the [paladin spell list](#section-paladin-spells), the spell is nonetheless a paladin spell for you.",
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Lay on Hands',
    slug: 'paladin-lay-on-hands',
    description:
      'Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest. With that pool, you can restore a total number of hit points equal to your paladin level × 5.\n\nAs an action, you can touch a creature and draw power from the pool to restore a number of hit points to that creature, up to the maximum amount remaining in your pool.\n\nAlternatively, you can expend 5 hit points from your pool of healing to cure the target of one disease or neutralize one poison affecting it. You can cure multiple diseases and neutralize multiple poisons with a single use of Lay on Hands, expending hit points separately for each one.\n\nThis feature has no effect on undead and constructs.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Improved Divine Smite',
    slug: 'paladin-improved-divine-smite',
    description:
      'By 11th level, you are so suffused with righteous might that all your melee weapon strikes carry divine power with them. Whenever you hit a creature with a melee weapon, the creature takes an extra 1d8 radiant damage. If you also use your Divine Smite with an attack, you add this damage to the extra damage of your Divine Smite.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Great Weapon Fighting',
    slug: 'paladin-great-weapon-fighting',
    description:
      'When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon that you are wielding with two hands, you can reroll the die and must use the new roll. The weapon must have the two-handed or versatile property for you to gain this benefit.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Fighting Style',
    slug: 'paladin-fighting-style',
    description:
      "At 2nd level, you adopt a style of fighting as your specialty. Choose one of the following options. You can't take a Fighting Style option more than once, even if you later get to choose again.",
    level: 2,
    tags: ['class_paladin'],
  },
  {
    name: 'Extra Attack',
    slug: 'paladin-extra-attack',
    description:
      'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.',
    level: 5,
    tags: ['class_paladin'],
  },
  {
    name: 'Dueling',
    slug: 'paladin-dueling',
    description:
      'When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Divine Smite',
    slug: 'paladin-divine-smite',
    description:
      "Starting at 2nd level, when you hit a creature with a melee weapon attack, you can expend one spell slot to deal radiant damage to the target, in addition to the weapon's damage. The extra damage is 2d8 for a 1st-level spell slot, plus 1d8 for each spell level higher than 1st, to a maximum of 5d8. The damage increases by 1d8 if the target is an undead or a fiend.",
    level: 2,
    tags: ['class_paladin'],
  },
  {
    name: 'Divine Sense',
    slug: 'paladin-divine-sense',
    description:
      'The presence of strong evil registers on your senses like a noxious odor, and powerful good rings like heavenly music in your ears. As an action, you can open your awareness to detect such forces. Until the end of your next turn, you know the location of any celestial, fiend, or undead within 60 feet of you that is not behind total cover. You know the type (celestial, fiend, or undead) of any being whose presence you sense, but not its identity (the vampire Count Dracula, for instance). Within the same radius, you also detect the presence of any place or object that has been consecrated or desecrated, as with the [_hallow_](#hallow) spell.\n\nYou can use this feature a number of times equal to 1 + your Charisma modifier. When you finish a long rest, you regain all expended uses.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Divine Health',
    slug: 'paladin-divine-health',
    description: 'By 3rd level, the divine magic flowing through you makes you immune to disease.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Defense',
    slug: 'paladin-defense',
    description: 'While you are wearing armor, you gain a +1 bonus to AC.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Cleansing Touch',
    slug: 'paladin-cleansing-touch',
    description:
      'Beginning at 14th level, you can use your action to end one spell on yourself or on one willing creature that you touch.\n\nYou can use this feature a number of times equal to your Charisma modifier (a minimum of once). You regain expended uses when you finish a long rest.',
    level: 14,
    tags: ['class_paladin'],
  },
  {
    name: 'Channel Divinity',
    slug: 'paladin-channel-divinity',
    description:
      'Your oath allows you to channel divine energy to fuel magical effects. Each Channel Divinity option provided by your oath explains how to use it.\n\nWhen you use your Channel Divinity, you choose which option to use. You must then finish a short or long rest to use your Channel Divinity again.\n\nSome Channel Divinity effects require saving throws. When you use such an effect from this class, the DC equals your paladin spell save DC.',
    level: 1,
    tags: ['class_paladin'],
  },
  {
    name: 'Aura of Protection',
    slug: 'paladin-aura-of-protection',
    description:
      'Starting at 6th level, whenever you or a friendly creature within 10 feet of you must make a saving throw, the creature gains a bonus to the saving throw equal to your Charisma modifier (with a minimum bonus of +1). You must be conscious to grant this bonus.\n\nAt 18th level, the range of this aura increases to 30 feet.',
    level: 6,
    tags: ['class_paladin'],
  },
  {
    name: 'Aura of Courage',
    slug: 'paladin-aura-of-courage',
    description:
      "Starting at 10th level, you and friendly creatures within 10 feet of you can't be [frightened](#frightened) while you are conscious.\n\nAt 18th level, the range of this aura increases to 30 feet.",
    level: 10,
    tags: ['class_paladin'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'paladin-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_paladin'],
  },
  {
    name: 'Unarmored Movement',
    slug: 'monk-unarmored-movement',
    description:
      'Starting at 2nd level, your speed increases by 10 feet while you are not wearing armor or wielding a shield. This bonus increases when you reach certain monk levels, as shown in the Monk table.\n\nAt 9th level, you gain the ability to move along vertical surfaces and across liquids on your turn without falling during the move.',
    level: 2,
    tags: ['class_monk'],
  },
  {
    name: 'Unarmored Defense',
    slug: 'monk-unarmored-defense',
    description:
      'Beginning at 1st level, while you are wearing no armor and not wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.',
    level: 1,
    tags: ['class_monk'],
  },
  {
    name: 'Tongue of the Sun and Moon',
    slug: 'monk-tongue-of-the-sun-and-moon',
    description:
      'Starting at 13th level, you learn to touch the ki of other minds so that you understand all spoken languages. Moreover, any creature that can understand a language can understand what you say.',
    level: 13,
    tags: ['class_monk'],
  },
  {
    name: 'Timeless Body',
    slug: 'monk-timeless-body',
    description:
      "At 15th level, your ki sustains you so that you suffer none of the frailty of old age, and you can't be aged magically. You can still die of old age, however. In addition, you no longer need food or water.",
    level: 15,
    tags: ['class_monk'],
  },
  {
    name: 'Stunning Strike',
    slug: 'monk-stunning-strike',
    description:
      "Starting at 5th level, you can interfere with the flow of ki in an opponent's body. When you hit another creature with a melee weapon attack, you can spend 1 ki point to attempt a stunning strike. The target must succeed on a Constitution saving throw or be [stunned](#stunned) until the end of your next turn.",
    level: 5,
    tags: ['class_monk'],
  },
  {
    name: 'Stillness of Mind',
    slug: 'monk-stillness-of-mind',
    description:
      'Starting at 7th level, you can use your action to end one effect on yourself that is causing you to be [charmed](#charmed) or [frightened](#frightened).',
    level: 7,
    tags: ['class_monk'],
  },
  {
    name: 'Step of the Wind',
    slug: 'monk-step-of-the-wind',
    description:
      'You can spend 1 ki point to take the Disengage or Dash action as a bonus action on your turn, and your jump distance is doubled for the turn.',
    level: 1,
    tags: ['class_monk'],
  },
  {
    name: 'Slow Fall',
    slug: 'monk-slow-fall',
    description:
      'Beginning at 4th level, you can use your reaction when you fall to reduce any falling damage you take by an amount equal to five times your monk level.',
    level: 4,
    tags: ['class_monk'],
  },
  {
    name: 'Purity of Body',
    slug: 'monk-purity-of-body',
    description: 'At 10th level, your mastery of the ki flowing through you makes you immune to disease and poison.',
    level: 10,
    tags: ['class_monk'],
  },
  {
    name: 'Perfect Self',
    slug: 'monk-perfect-self',
    description: 'At 20th level, when you roll for initiative and have no ki points remaining, you regain 4 ki points.',
    level: 20,
    tags: ['class_monk'],
  },
  {
    name: 'Patient Defense',
    slug: 'monk-patient-defense',
    description: 'You can spend 1 ki point to take the Dodge action as a bonus action on your turn.',
    level: 1,
    tags: ['class_monk'],
  },
  {
    name: 'Monastic Tradition',
    slug: 'monk-monastic-tradition',
    description:
      'When you reach 3rd level, you commit yourself to a [monastic tradition](#section-monastic-traditions). Your tradition grants you features at 3rd level and again at 6th, 11th, and 17th level.',
    level: 3,
    tags: ['class_monk'],
  },
  {
    name: 'Martial Arts',
    slug: 'monk-martial-arts',
    description:
      "At 1st level, your practice of martial arts gives you mastery of combat styles that use unarmed strikes and monk weapons, which are shortswords and any simple melee weapons that don't have the two-handed or heavy property.\n\nYou gain the following benefits while you are unarmed or wielding only monk weapons and you aren't wearing armor or wielding a shield:\n\n- You can use Dexterity instead of Strength for the attack and damage rolls of your unarmed strikes and monk weapons.\n- You can roll a d4 in place of the normal damage of your unarmed strike or monk weapon. This die changes as you gain monk levels, as shown in the Martial Arts column of the Monk table.\n- When you use the Attack action with an unarmed strike or a monk weapon on your turn, you can make one unarmed strike as a bonus action. For example, if you take the Attack action and attack with a quarterstaff, you can also make an unarmed strike as a bonus action, assuming you haven't already taken a bonus action this turn.\n\nCertain monasteries use specialized forms of the monk weapons. For example, you might use a club that is two lengths of wood connected by a short chain (called a nunchaku) or a sickle with a shorter, straighter blade (called a kama). Whatever name you use for a monk weapon, you can use the game statistics provided for the weapon.",
    level: 1,
    tags: ['class_monk'],
  },
  {
    name: 'Ki',
    slug: 'monk-ki',
    description:
      "Starting at 2nd level, your training allows you to harness the mystic energy of ki. Your access to this energy is represented by a number of ki points. Your monk level determines the number of points you have, as shown in the Ki Points column of the Monk table.\n\nYou can spend these points to fuel various ki features. You start knowing three such features: Flurry of Blows, Patient Defense, and Step of the Wind. You learn more ki features as you gain levels in this class.\n\nWhen you spend a ki point, it is unavailable until you finish a short or long rest, at the end of which you draw all of your expended ki back into yourself. You must spend at least 30 minutes of the rest meditating to regain your ki points.\n\nSome of your ki features require your target to make a saving throw to resist the feature's effects. The saving throw DC is calculated as follows:\n\n|                                                                    |\n| :----------------------------------------------------------------: |\n| **Ki save DC** = 8 + your proficiency bonus + your Wisdom modifier |",
    level: 2,
    tags: ['class_monk'],
  },
  {
    name: 'Ki-Empowered Strikes',
    slug: 'monk-ki-empowered-strikes',
    description:
      'Starting at 6th level, your unarmed strikes count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.',
    level: 6,
    tags: ['class_monk'],
  },
  {
    name: 'Flurry of Blows',
    slug: 'monk-flurry-of-blows',
    description:
      'Immediately after you take the Attack action on your turn, you can spend 1 ki point to make two unarmed strikes as a bonus action.',
    level: 1,
    tags: ['class_monk'],
  },
  {
    name: 'Extra Attack',
    slug: 'monk-extra-attack',
    description:
      'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.',
    level: 5,
    tags: ['class_monk'],
  },
  {
    name: 'Evasion',
    slug: 'monk-evasion',
    description:
      "At 7th level, your instinctive agility lets you dodge out of the way of certain area effects, such as a blue dragon's lightning breath or a [_fireball_](#fireball) spell. When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.",
    level: 7,
    tags: ['class_monk'],
  },
  {
    name: 'Empty Body',
    slug: 'monk-empty-body',
    description:
      "Beginning at 18th level, you can use your action to spend 4 ki points to become [invisible](#invisible) for 1 minute. During that time, you also have resistance to all damage but force damage.\n\nAdditionally, you can spend 8 ki points to cast the [_astral projection_](#astral-projection) spell, without needing material components. When you do so, you can't take any other creatures with you.",
    level: 18,
    tags: ['class_monk'],
  },
  {
    name: 'Diamond Soul',
    slug: 'monk-diamond-soul',
    description:
      'Beginning at 14th level, your mastery of ki grants you proficiency in all saving throws.\n\nAdditionally, whenever you make a saving throw and fail, you can spend 1 ki point to reroll it and take the second result.',
    level: 14,
    tags: ['class_monk'],
  },
  {
    name: 'Deflect Missiles',
    slug: 'monk-deflect-missiles',
    description:
      'Starting at 3rd level, you can use your reaction to deflect or catch the missile when you are hit by a ranged weapon attack. When you do so, the damage you take from the attack is reduced by 1d10 + your Dexterity modifier + your monk level.\n\nIf you reduce the damage to 0, you can catch the missile if it is small enough for you to hold in one hand and you have at least one hand free. If you catch a missile in this way, you can spend 1 ki point to make a ranged attack with the weapon or piece of ammunition you just caught, as part of the same reaction. You make this attack with proficiency, regardless of your weapon proficiencies, and the missile counts as a monk weapon for the attack, which has a normal range of 20 feet and a long range of 60 feet.',
    level: 3,
    tags: ['class_monk'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'monk-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_monk'],
  },
  {
    name: 'Two-Weapon Fighting',
    slug: 'fighter-two-weapon-fighting',
    description:
      'When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack.',
    level: 1,
    tags: ['class_fighter'],
  },
  {
    name: 'Second Wind',
    slug: 'fighter-second-wind',
    description:
      'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.',
    level: 1,
    tags: ['class_fighter'],
  },
  {
    name: 'Protection',
    slug: 'fighter-protection',
    description:
      'When a creature you can see attacks a target other than you that is within 5 feet of you, you can use your reaction to impose disadvantage on the attack roll. You must be wielding a shield.',
    level: 1,
    tags: ['class_fighter'],
  },
  {
    name: 'Martial Archetype',
    slug: 'fighter-martial-archetype',
    description:
      'At 3rd level, you choose an [archetype](#section-martial-archetypes) that you strive to emulate in your combat styles and techniques. The archetype you choose grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.',
    level: 3,
    tags: ['class_fighter'],
  },
  {
    name: 'Indomitable',
    slug: 'fighter-indomitable',
    description:
      "Beginning at 9th level, you can reroll a saving throw that you fail. If you do so, you must use the new roll, and you can't use this feature again until you finish a long rest.\n\nYou can use this feature twice between long rests starting at 13th level and three times between long rests starting at 17th level.",
    level: 9,
    tags: ['class_fighter'],
  },
  {
    name: 'Great Weapon Fighting',
    slug: 'fighter-great-weapon-fighting',
    description:
      'When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon that you are wielding with two hands, you can reroll the die and must use the new roll, even if the new roll is a 1 or a 2. The weapon must have the two-handed or versatile property for you to gain this benefit.',
    level: 1,
    tags: ['class_fighter'],
  },
  {
    name: 'Fighting Style',
    slug: 'fighter-fighting-style',
    description:
      "You adopt a particular style of fighting as your specialty. Choose one of the following options. You can't take a Fighting Style option more than once, even if you later get to choose again.",
    level: 1,
    tags: ['class_fighter'],
  },
  {
    name: 'Extra Attack',
    slug: 'fighter-extra-attack',
    description:
      'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.\n\nThe number of attacks increases to three when you reach 11th level in this class and to four when you reach 20th level in this class.',
    level: 5,
    tags: ['class_fighter'],
  },
  {
    name: 'Dueling',
    slug: 'fighter-dueling',
    description:
      'When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.',
    level: 1,
    tags: ['class_fighter'],
  },
  {
    name: 'Defense',
    slug: 'fighter-defense',
    description: 'While you are wearing armor, you gain a +1 bonus to AC.',
    level: 1,
    tags: ['class_fighter'],
  },
  {
    name: 'Archery',
    slug: 'fighter-archery',
    description: 'You gain a +2 bonus to attack rolls you make with ranged weapons.',
    level: 1,
    tags: ['class_fighter'],
  },
  {
    name: 'Action Surge',
    slug: 'fighter-action-surge',
    description:
      'Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action on top of your regular action and a possible bonus action. Once you use this feature, you must finish a short or long rest before you can use it again. Starting at 17th level, you can use it twice before a rest, but only once on the same turn.',
    level: 2,
    tags: ['class_fighter'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'fighter-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_fighter'],
  },
  {
    name: 'Wild Shape',
    slug: 'druid-wild-shape',
    description:
      'Starting at 2nd level, you can use your action to magically assume the shape of a beast that you have seen before. You can use this feature twice. You regain expended uses when you finish a short or long rest.\n\nYour druid level determines the beasts you can transform into, as shown in the Beast Shapes table. At 2nd level, for example, you can transform into any beast that has a challenge rating of 1/4 or lower that doesn\'t have a flying or swimming speed.\n\n<table style="width:83%;">\n<caption>Beast Shapes</caption>\n<colgroup>\n<col width="11%" />\n<col width="13%" />\n<col width="40%" />\n<col width="18%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center">Level</th>\n<th align="center">Max. CR</th>\n<th align="left">Limitations</th>\n<th align="left">Example</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">2nd</td>\n<td align="center">1/4</td>\n<td align="left">No flying or swimming speed</td>\n<td align="left">Wolf</td>\n</tr>\n<tr class="even">\n<td align="center">4th</td>\n<td align="center">1/2</td>\n<td align="left">No flying speed</td>\n<td align="left">Crocodile</td>\n</tr>\n<tr class="odd">\n<td align="center">8th</td>\n<td align="center">1</td>\n<td align="left">—</td>\n<td align="left">Giant eagle</td>\n</tr>\n</tbody>\n</table>\n\nYou can stay in a beast shape for a number of hours equal to half your druid level (rounded down). You then revert to your normal form unless you expend another use of this feature. You can revert to your normal form earlier by using a bonus action on your turn. You automatically revert if you fall [unconscious](#unconscious), drop to 0 hit points, or die.\n\nWhile you are transformed, the following rules apply:\n\n- Your game statistics are replaced by the statistics of the beast, but you retain your alignment, personality, and Intelligence, Wisdom, and Charisma scores. You also retain all of your skill and saving throw proficiencies, in addition to gaining those of the creature. If the creature has the same proficiency as you and the bonus in its stat block is higher than yours, use the creature\'s bonus instead of yours. If the creature has any legendary or lair actions, you can\'t use them.\n- When you transform, you assume the beast\'s hit points and Hit Dice. When you revert to your normal form, you return to the number of hit points you had before you transformed. However, if you revert as a result of dropping to 0 hit points, any excess damage carries over to your normal form. For example, if you take 10 damage in animal form and have only 1 hit point left, you revert and take 9 damage. As long as the excess damage doesn\'t reduce your normal form to 0 hit points, you aren\'t knocked [unconscious](#unconscious).\n- You can\'t cast spells, and your ability to speak or take any action that requires hands is limited to the capabilities of your beast form. Transforming doesn\'t break your concentration on a spell you\'ve already cast, however, or prevent you from taking actions that are part of a spell, such as [_call lightning_](#call-lightning), that you\'ve already cast.\n- You retain the benefit of any features from your class, race, or other source and can use them if the new form is physically capable of doing so. However, you can\'t use any of your special senses, such as darkvision, unless your new form also has that sense.\n- You choose whether your equipment falls to the ground in your space, merges into your new form, or is worn by it. Worn equipment functions as normal, but the GM decides whether it is practical for the new form to wear a piece of equipment, based on the creature\'s shape and size. Your equipment doesn\'t change size or shape to match the new form, and any equipment that the new form can\'t wear must either fall to the ground or merge with it. Equipment that merges with the form has no effect until you leave the form.',
    level: 2,
    tags: ['class_druid'],
  },
  {
    name: 'Timeless Body',
    slug: 'druid-timeless-body',
    description:
      'Starting at 18th level, the primal magic that you wield causes you to age more slowly. For every 10 years that pass, your body ages only 1 year.',
    level: 18,
    tags: ['class_druid'],
  },
  {
    name: 'Spellcasting',
    slug: 'druid-spellcasting',
    description:
      'Drawing on the divine essence of nature itself, you can cast spells to shape that essence to your will.',
    level: 1,
    tags: ['class_druid'],
  },
  {
    name: 'Spellcasting Focus',
    slug: 'druid-spellcasting-focus',
    description:
      'You can use a [druidic focus](#section-adventuring-gear) as a spellcasting focus for your druid spells.',
    level: 1,
    tags: ['class_druid'],
  },
  {
    name: 'Spellcasting Ability',
    slug: 'druid-spellcasting-ability',
    description:
      'Wisdom is your spellcasting ability for your druid spells, since your magic draws upon your devotion and attunement to nature. You use your Wisdom whenever a spell refers to your spellcasting ability. In addition, you use your Wisdom modifier when setting the saving throw DC for a druid spell you cast and when making an attack roll with one.\n\n<table>\n<colgroup>\n<col width="100%" />\n</colgroup>\n<tbody>\n<tr class="odd">\n<td align="center"><strong>Spell save DC</strong> = 8 + your proficiency bonus + your Wisdom modifier</td>\n</tr>\n<tr class="even">\n<td align="center"><strong>Spell attack modifier</strong> = your proficiency bonus + your Wisdom modifier</td>\n</tr>\n</tbody>\n</table>',
    level: 1,
    tags: ['class_druid'],
  },
  {
    name: 'Ritual Casting',
    slug: 'druid-ritual-casting',
    description:
      'You can cast a druid spell as a ritual if that spell has the ritual tag and you have the spell prepared.',
    level: 1,
    tags: ['class_druid'],
  },
  {
    name: 'Preparing and Casting Spells',
    slug: 'druid-preparing-and-casting-spells',
    description:
      '<table style="width:100%;">\n<caption>Druid Spell Slots per Level</caption>\n<colgroup>\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center" rowspan=2>Druid Level</th>\n<th align="center" colspan=9>Spell Level</th>\n</tr>\n<tr class="header">\n<th align="center">1st</th>\n<th align="center">2nd</th>\n<th align="center">3rd</th>\n<th align="center">4th</th>\n<th align="center">5th</th>\n<th align="center">6th</th>\n<th align="center">7th</th>\n<th align="center">8th</th>\n<th align="center">9th</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">1st</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">2nd</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">3rd</td>\n<td align="center">4</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">4th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">5th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">6th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">7th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">8th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">9th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">10th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">11th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">12th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">13th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">14th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">15th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">16th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">17th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">18th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="odd">\n<td align="center">19th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">20th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n</tbody>\n</table>\n\nThe Druid Spell Slots per Level table shows how many spell slots you have to cast your spells of 1st level and higher. To cast one of these druid spells, you must expend a slot of the spell\'s level or higher. You regain all expended spell slots when you finish a long rest.\n\nYou prepare the list of druid spells that are available for you to cast, choosing from the [druid spell list](#section-druid-spells). When you do so, choose a number of druid spells equal to your Wisdom modifier + your druid level (minimum of one spell). The spells must be of a level for which you have spell slots.\n\nFor example, if you are a 3rd-level druid, you have four 1st-level and two 2nd-level spell slots. With a Wisdom of 16, your list of prepared spells can include six spells of 1st or 2nd level, in any combination. If you prepare the 1st-level spell [_cure wounds_](#cure-wounds), you can cast it using a 1st-level or 2nd-level slot. Casting the spell doesn\'t remove it from your list of prepared spells.\n\nYou can also change your list of prepared spells when you finish a long rest. Preparing a new list of druid spells requires time spent in prayer and meditation: at least 1 minute per spell level for each spell on your list.',
    level: 1,
    tags: ['class_druid'],
  },
  {
    name: 'Druidic',
    slug: 'druid-druidic',
    description:
      "You know Druidic, the secret language of druids. You can speak the language and use it to leave hidden messages. You and others who know this language automatically spot such a message. Others spot the message's presence with a successful DC 15 Wisdom (Perception) check but can't decipher it without magic.",
    level: 1,
    tags: ['class_druid'],
  },
  {
    name: 'Druid Circle',
    slug: 'druid-druid-circle',
    description:
      'At 2nd level, you choose to identify with a [circle of druids](#section-druid-circles). Your choice grants you features at 2nd level and again at 6th, 10th, and 14th level.',
    level: 2,
    tags: ['class_druid'],
  },
  {
    name: 'Cantrips',
    slug: 'druid-cantrips',
    description:
      'At 1st level, you know two cantrips of your choice from the [druid spell list](#section-druid-spells). You learn additional druid cantrips of your choice at higher levels, as shown in the Cantrips Known column of the Druid table.',
    level: 1,
    tags: ['class_druid'],
  },
  {
    name: 'Beast Spells',
    slug: 'druid-beast-spells',
    description:
      "Beginning at 18th level, you can cast many of your druid spells in any shape you assume using Wild Shape. You can perform the somatic and verbal components of a druid spell while in a beast shape, but you aren't able to provide material components.",
    level: 18,
    tags: ['class_druid'],
  },
  {
    name: 'Archdruid',
    slug: 'druid-archdruid',
    description:
      'At 20th level, you can use your Wild Shape an unlimited number of times.\n\nAdditionally, you can ignore the verbal and somatic components of your druid spells, as well as any material components that lack a cost and aren\'t consumed by a spell. You gain this benefit in both your normal shape and your beast shape from Wild Shape.\n\n> #### Sacred Plants and Wood\n>\n> A druid holds certain plants to be sacred, particularly alder, ash, birch, elder, hazel, holly, juniper, mistletoe, oak, rowan, willow, and yew. Druids often use such plants as part of a spellcasting focus, incorporating lengths of oak or yew or sprigs of mistletoe.\n>\n> Similarly, a druid uses such woods to make other objects, such as weapons and shields. Yew is associated with death and rebirth, so weapon handles for scimitars or sickles might be fashioned from it. Ash is associated with life and oak with strength. These woods make excellent hafts or whole weapons, such as clubs or quarterstaffs, as well as shields. Alder is associated with air, and it might be used for thrown weapons, such as darts or javelins.\n>\n> Druids from regions that lack the plants described here have chosen other plants to take on similar uses. For instance, a druid of a desert region might value the yucca tree and cactus plants.\n\n> #### Druids and the Gods\n>\n> Some druids venerate the forces of nature themselves, but most druids are devoted to one of the many nature deities worshiped in the multiverse (the lists of gods in the "[Pantheons](#chapter-pantheons)" section include many such deities). The worship of these deities is often considered a more ancient tradition than the faiths of clerics and urbanized peoples.',
    level: 20,
    tags: ['class_druid'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'druid-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_druid'],
  },
  {
    name: 'Spellcasting',
    slug: 'cleric-spellcasting',
    description: 'As a conduit for divine power, you can cast cleric spells.',
    level: 1,
    tags: ['class_cleric'],
  },
  {
    name: 'Spellcasting Focus',
    slug: 'cleric-spellcasting-focus',
    description:
      'You can use a [holy symbol](#section-adventuring-gear) as a spellcasting focus for your cleric spells.',
    level: 1,
    tags: ['class_cleric'],
  },
  {
    name: 'Spellcasting Ability',
    slug: 'cleric-spellcasting-ability',
    description:
      'Wisdom is your spellcasting ability for your cleric spells. The power of your spells comes from your devotion to your deity. You use your Wisdom whenever a cleric spell refers to your spellcasting ability. In addition, you use your Wisdom modifier when setting the saving throw DC for a cleric spell you cast and when making an attack roll with one.\n\n<table>\n<colgroup>\n<col width="100%" />\n</colgroup>\n<tbody>\n<tr class="odd">\n<td align="center"><strong>Spell save DC</strong> = 8 + your proficiency bonus + your Wisdom modifier</td>\n</tr>\n<tr class="even">\n<td align="center"><strong>Spell attack modifier</strong> = your proficiency bonus + your Wisdom modifier</td>\n</tr>\n</tbody>\n</table>',
    level: 1,
    tags: ['class_cleric'],
  },
  {
    name: 'Ritual Casting',
    slug: 'cleric-ritual-casting',
    description:
      'You can cast a cleric spell as a ritual if that spell has the ritual tag and you have the spell prepared.',
    level: 1,
    tags: ['class_cleric'],
  },
  {
    name: 'Preparing and Casting Spells',
    slug: 'cleric-preparing-and-casting-spells',
    description:
      '<table style="width:100%;">\n<caption>Cleric Spell Slots per Level</caption>\n<colgroup>\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center" rowspan=2>Cleric Level</th>\n<th align="center" colspan=9>Spell Level</th>\n</tr>\n<tr class="header">\n<th align="center">1st</th>\n<th align="center">2nd</th>\n<th align="center">3rd</th>\n<th align="center">4th</th>\n<th align="center">5th</th>\n<th align="center">6th</th>\n<th align="center">7th</th>\n<th align="center">8th</th>\n<th align="center">9th</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">1st</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">2nd</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">3rd</td>\n<td align="center">4</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">4th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">5th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">6th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">7th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">8th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">9th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">10th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">11th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">12th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">13th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">14th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">15th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">16th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">17th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">18th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="odd">\n<td align="center">19th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">20th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n</tbody>\n</table>\n\nThe Cleric Spell Slots per Level table shows how many spell slots you have to cast your spells of 1st level and higher. To cast one of these spells, you must expend a slot of the spell\'s level or higher. You regain all expended spell slots when you finish a long rest.\n\nYou prepare the list of cleric spells that are available for you to cast, choosing from the [cleric spell list](#section-cleric-spells). When you do so, choose a number of cleric spells equal to your Wisdom modifier + your cleric level (minimum of one spell). The spells must be of a level for which you have spell slots.\n\nFor example, if you are a 3rd-level cleric, you have four 1st-level and two 2nd-level spell slots. With a Wisdom of 16, your list of prepared spells can include six spells of 1st or 2nd level, in any combination. If you prepare the 1st-level spell [_cure wounds_](#cure-wounds), you can cast it using a 1st-level or 2nd-level slot. Casting the spell doesn\'t remove it from your list of prepared spells.\n\nYou can change your list of prepared spells when you finish a long rest. Preparing a new list of cleric spells requires time spent in prayer and meditation: at least 1 minute per spell level for each spell on your list.',
    level: 1,
    tags: ['class_cleric'],
  },
  {
    name: 'Domain Spells',
    slug: 'cleric-domain-spells',
    description:
      "Each domain has a list of spells—its domain spells—that you gain at the cleric levels noted in the domain description. Once you gain a domain spell, you always have it prepared, and it doesn't count against the number of spells you can prepare each day.\n\nIf you have a domain spell that doesn't appear on the [cleric spell list](#section-cleric-spells), the spell is nonetheless a cleric spell for you.",
    level: 1,
    tags: ['class_cleric'],
  },
  {
    name: 'Divine Intervention',
    slug: 'cleric-divine-intervention',
    description:
      "Beginning at 10th level, you can call on your deity to intervene on your behalf when your need is great.\n\nImploring your deity's aid requires you to use your action. Describe the assistance you seek, and roll percentile dice. If you roll a number equal to or lower than your cleric level, your deity intervenes.\n\nThe GM chooses the nature of the intervention; the effect of any cleric spell or cleric domain spell would be appropriate.\n\nIf your deity intervenes, you can't use this feature again for 7 days. Otherwise, you can use it again after you finish a long rest.\n\nAt 20th level, your call for intervention succeeds automatically, no roll required.",
    level: 10,
    tags: ['class_cleric'],
  },
  {
    name: 'Divine Domain',
    slug: 'cleric-divine-domain',
    description:
      'Choose one [domain](#section-domains) related to your deity. Each domain provides examples of gods associated with it. Your choice grants you domain spells and other features when you choose it at 1st level. It also grants you additional ways to use Channel Divinity when you gain that feature at 2nd level, and additional benefits at 6th, 8th, and 17th levels.',
    level: 1,
    tags: ['class_cleric'],
  },
  {
    name: 'Destroy Undead',
    slug: 'cleric-destroy-undead',
    description:
      'Starting at 5th level, when an undead fails its saving throw against your Turn Undead feature, the creature is instantly destroyed if its challenge rating is at or below a certain threshold, as shown in the Destroy Undead table.\n\n<table style="width:62%;">\n<caption>Destroy Undead</caption>\n<colgroup>\n<col width="20%" />\n<col width="41%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center">Cleric Level</th>\n<th align="left">Destroys Undead of CR…</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">5th</td>\n<td align="left">1/2 or lower</td>\n</tr>\n<tr class="even">\n<td align="center">8th</td>\n<td align="left">1 or lower</td>\n</tr>\n<tr class="odd">\n<td align="center">11th</td>\n<td align="left">2 or lower</td>\n</tr>\n<tr class="even">\n<td align="center">14th</td>\n<td align="left">3 or lower</td>\n</tr>\n<tr class="odd">\n<td align="center">17th</td>\n<td align="left">4 or lower</td>\n</tr>\n</tbody>\n</table>',
    level: 5,
    tags: ['class_cleric'],
  },
  {
    name: 'Channel Divinity',
    slug: 'cleric-channel-divinity',
    description:
      'At 2nd level, you gain the ability to channel divine energy directly from your deity, using that energy to fuel magical effects. You start with two such effects: Turn Undead and an effect determined by your domain. Some domains grant you additional effects as you advance in levels, as noted in the domain description.\n\nWhen you use your Channel Divinity, you choose which effect to create. You must then finish a short or long rest to use your Channel Divinity again.\n\nSome Channel Divinity effects require saving throws. When you use such an effect from this class, the DC equals your cleric spell save DC.\n\nBeginning at 6th level, you can use your Channel Divinity twice between rests, and beginning at 18th level, you can use it three times between rests. When you finish a short or long rest, you regain your expended uses.',
    level: 2,
    tags: ['class_cleric'],
  },
  {
    name: 'Channel Divinity: Turn Undead',
    slug: 'cleric-channel-divinity-turn-undead',
    description:
      "As an action, you present your holy symbol and speak a prayer censuring the undead. Each undead that can see or hear you within 30 feet of you must make a Wisdom saving throw. If the creature fails its saving throw, it is turned for 1 minute or until it takes any damage.\n\nA turned creature must spend its turns trying to move as far away from you as it can, and it can't willingly move to a space within 30 feet of you. It also can't take reactions. For its action, it can use only the Dash action or try to escape from an effect that prevents it from moving. If there's nowhere to move, the creature can use the Dodge action.",
    level: 1,
    tags: ['class_cleric'],
  },
  {
    name: 'Cantrips',
    slug: 'cleric-cantrips',
    description:
      'At 1st level, you know three cantrips of your choice from the [cleric spell list](#section-cleric-spells). You learn additional cleric cantrips of your choice at higher levels, as shown in the Cantrips Known column of the Cleric table.',
    level: 1,
    tags: ['class_cleric'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'cleric-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_cleric'],
  },
  {
    name: 'Superior Inspiration',
    slug: 'bard-superior-inspiration',
    description:
      'At 20th level, when you roll initiative and have no uses of Bardic Inspiration left, you regain one use.',
    level: 20,
    tags: ['class_bard'],
  },
  {
    name: 'Spells Known of 1st Level and Higher',
    slug: 'bard-spells-known-of-1st-level-and-higher',
    description:
      'You know four 1st-level spells of your choice from the [bard spell list](#section-bard-spells).\n\nThe Spells Known column of the Bard table shows when you learn more bard spells of your choice. Each of these spells must be of a level for which you have spell slots, as shown on the table. For instance, when you reach 3rd level in this class, you can learn one new spell of 1st or 2nd level.\n\nAdditionally, when you gain a level in this class, you can choose one of the bard spells you know and replace it with another spell from the bard spell list, which also must be of a level for which you have spell slots.',
    level: 3,
    tags: ['class_bard'],
  },
  {
    name: 'Spellcasting',
    slug: 'bard-spellcasting',
    description:
      'You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music. Your spells are part of your vast repertoire, magic that you can tune to different situations.',
    level: 1,
    tags: ['class_bard'],
  },
  {
    name: 'Spellcasting Focus',
    slug: 'bard-spellcasting-focus',
    description: 'You can use a [musical instrument](#section-tools) as a spellcasting focus for your bard spells.',
    level: 1,
    tags: ['class_bard'],
  },
  {
    name: 'Spellcasting Ability',
    slug: 'bard-spellcasting-ability',
    description:
      'Charisma is your spellcasting ability for your bard spells. Your magic comes from the heart and soul you pour into the performance of your music or oration. You use your Charisma whenever a spell refers to your spellcasting ability. In addition, you use your Charisma modifier when setting the saving throw DC for a bard spell you cast and when making an attack roll with one.\n\n<table>\n<colgroup>\n<col width="100%" />\n</colgroup>\n<tbody>\n<tr class="odd">\n<td align="center"><strong>Spell save DC</strong> = 8 + your proficiency bonus + your Charisma modifier</td>\n</tr>\n<tr class="even">\n<td align="center"><strong>Spell attack modifier</strong> = your proficiency bonus + your Charisma modifier</td>\n</tr>\n</tbody>\n</table>',
    level: 1,
    tags: ['class_bard'],
  },
  {
    name: 'Spell Slots',
    slug: 'bard-spell-slots',
    description:
      '<table style="width:100%;">\n<caption>Bard Spell Slots per Level</caption>\n<colgroup>\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n<col width="10%" />\n</colgroup>\n<thead>\n<tr class="header">\n<th align="center" rowspan=2>Bard Level</th>\n<th align="center" colspan=9>Spell Level</th>\n</tr>\n<tr class="header">\n<th align="center">1st</th>\n<th align="center">2nd</th>\n<th align="center">3rd</th>\n<th align="center">4th</th>\n<th align="center">5th</th>\n<th align="center">6th</th>\n<th align="center">7th</th>\n<th align="center">8th</th>\n<th align="center">9th</th>\n</tr>\n</thead>\n<tbody>\n<tr class="odd">\n<td align="center">1st</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">2nd</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">3rd</td>\n<td align="center">4</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">4th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">5th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">6th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">7th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">8th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">9th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">10th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">11th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">12th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">13th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">14th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">15th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="even">\n<td align="center">16th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">—</td>\n</tr>\n<tr class="odd">\n<td align="center">17th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">18th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="odd">\n<td align="center">19th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n<tr class="even">\n<td align="center">20th</td>\n<td align="center">4</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">3</td>\n<td align="center">2</td>\n<td align="center">2</td>\n<td align="center">1</td>\n<td align="center">1</td>\n</tr>\n</tbody>\n</table>\n\nThe Bard Spell Slots per Level table shows how many spell slots you have to cast your spells of 1st level and higher. To cast one of these spells, you must expend a slot of the spell\'s level or higher. You regain all expended spell slots when you finish a long rest.\n\nFor example, if you know the 1st-level spell [_cure wounds_](#cure-wounds) and have a 1st-level and a 2nd-level spell slot available, you can cast [_cure wounds_](#cure-wounds) using either slot.',
    level: 1,
    tags: ['class_bard'],
  },
  {
    name: 'Song of Rest',
    slug: 'bard-song-of-rest',
    description:
      'Beginning at 2nd level, you can use soothing music or oration to help revitalize your wounded allies during a short rest. If you or any friendly creatures who can hear your performance regain hit points at the end of the short rest by spending one or more Hit Dice, each of those creatures regains an extra 1d6 hit points.\n\nThe extra hit points increase when you reach certain levels in this class: to 1d8 at 9th level, to 1d10 at 13th level, and to 1d12 at 17th level.',
    level: 2,
    tags: ['class_bard'],
  },
  {
    name: 'Ritual Casting',
    slug: 'bard-ritual-casting',
    description: 'You can cast any bard spell you know as a ritual if that spell has the ritual tag.',
    level: 1,
    tags: ['class_bard'],
  },
  {
    name: 'Magical Secrets',
    slug: 'bard-magical-secrets',
    description:
      'By 10th level, you have plundered magical knowledge from a wide spectrum of disciplines. Choose two spells from any class, including this one. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip.\n\nThe chosen spells count as bard spells for you and are included in the number in the Spells Known column of the Bard table.\n\nYou learn two additional spells from any class at 14th level and again at 18th level.',
    level: 14,
    tags: ['class_bard'],
  },
  {
    name: 'Jack of All Trades',
    slug: 'bard-jack-of-all-trades',
    description:
      "Starting at 2nd level, you can add half your proficiency bonus, rounded down, to any ability check you make that doesn't already include your proficiency bonus.",
    level: 2,
    tags: ['class_bard'],
  },
  {
    name: 'Font of Inspiration',
    slug: 'bard-font-of-inspiration',
    description:
      'Beginning when you reach 5th level, you regain all of your expended uses of Bardic Inspiration when you finish a short or long rest.',
    level: 5,
    tags: ['class_bard'],
  },
  {
    name: 'Expertise',
    slug: 'bard-expertise',
    description:
      'At 3rd level, choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.\n\nAt 10th level, you can choose another two skill proficiencies to gain this benefit.',
    level: 3,
    tags: ['class_bard'],
  },
  {
    name: 'Countercharm',
    slug: 'bard-countercharm',
    description:
      'At 6th level, you gain the ability to use musical notes or words of power to disrupt mind-influencing effects. As an action, you can start a performance that lasts until the end of your next turn. During that time, you and any friendly creatures within 30 feet of you have advantage on saving throws against being [frightened](#frightened) or [charmed](#charmed). A creature must be able to hear you to gain this benefit. The performance ends early if you are [incapacitated](#incapacitated) or silenced or if you voluntarily end it (no action required).',
    level: 6,
    tags: ['class_bard'],
  },
  {
    name: 'Cantrips',
    slug: 'bard-cantrips',
    description:
      'You know two cantrips of your choice from the [bard spell list](#section-bard-spells). You learn additional bard cantrips of your choice at higher levels, as shown in the Cantrips Known column of the Bard table.',
    level: 1,
    tags: ['class_bard'],
  },
  {
    name: 'Bardic Inspiration',
    slug: 'bard-bardic-inspiration',
    description:
      'You can inspire others through stirring words or music. To do so, you use a bonus action on your turn to choose one creature other than yourself within 60 feet of you who can hear you. That creature gains one Bardic Inspiration die, a d6.\n\nOnce within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, attack roll, or saving throw it makes. The creature can wait until after it rolls the d20 before deciding to use the Bardic Inspiration die, but must decide before the GM says whether the roll succeeds or fails. Once the Bardic Inspiration die is rolled, it is lost. A creature can have only one Bardic Inspiration die at a time.\n\nYou can use this feature a number of times equal to your Charisma modifier (a minimum of once). You regain any expended uses when you finish a long rest.\n\nYour Bardic Inspiration die changes when you reach certain levels in this class. The die becomes a d8 at 5th level, a d10 at 10th level, and a d12 at 15th level.',
    level: 5,
    tags: ['class_bard'],
  },
  {
    name: 'Bard College',
    slug: 'bard-bard-college',
    description:
      'At 3rd level, you delve into the advanced techniques of a [bard college](#section-bard-colleges) of your choice. Your choice grants you features at 3rd level and again at 6th and 14th level.',
    level: 3,
    tags: ['class_bard'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'bard-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_bard'],
  },
  {
    name: 'Unarmored Defense',
    slug: 'barbarian-unarmored-defense',
    description:
      'While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.',
    level: 1,
    tags: ['class_barbarian'],
  },
  {
    name: 'Relentless Rage',
    slug: 'barbarian-relentless-rage',
    description:
      "Starting at 11th level, your rage can keep you fighting despite grievous wounds. If you drop to 0 hit points while you're raging and don't die outright, you can make a DC 10 Constitution saving throw. If you succeed, you drop to 1 hit point instead.\n\nEach time you use this feature after the first, the DC increases by 5. When you finish a short or long rest, the DC resets to 10.",
    level: 11,
    tags: ['class_barbarian'],
  },
  {
    name: 'Reckless Attack',
    slug: 'barbarian-reckless-attack',
    description:
      'Starting at 2nd level, you can throw aside all concern for defense to attack with fierce desperation. When you make your first attack on your turn, you can decide to attack recklessly. Doing so gives you advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn.',
    level: 2,
    tags: ['class_barbarian'],
  },
  {
    name: 'Rage',
    slug: 'barbarian-rage',
    description:
      "In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action.\n\nWhile raging, you gain the following benefits if you aren't wearing heavy armor:\n\n- You have advantage on Strength checks and Strength saving throws.\n- When you make a melee weapon attack using Strength, you gain a bonus to the damage roll that increases as you gain levels as a barbarian, as shown in the Rage Damage column of the Barbarian table.\n- You have resistance to bludgeoning, piercing, and slashing damage.\n\nIf you are able to cast spells, you can't cast them or concentrate on them while raging.\n\nYour rage lasts for 1 minute. It ends early if you are knocked [unconscious](#unconscious) or if your turn ends and you haven't attacked a hostile creature since your last turn or taken damage since then. You can also end your rage on your turn as a bonus action.\n\nOnce you have raged the number of times shown for your barbarian level in the Rages column of the Barbarian table, you must finish a long rest before you can rage again.",
    level: 1,
    tags: ['class_barbarian'],
  },
  {
    name: 'Primal Path',
    slug: 'barbarian-primal-path',
    description:
      'At 3rd level, you choose a [path](#section-barbarian-paths) that shapes the nature of your rage. Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels.',
    level: 3,
    tags: ['class_barbarian'],
  },
  {
    name: 'Primal Champion',
    slug: 'barbarian-primal-champion',
    description:
      'At 20th level, you embody the power of the wilds. Your Strength and Constitution scores increase by 4. Your maximum for those scores is now 24.',
    level: 20,
    tags: ['class_barbarian'],
  },
  {
    name: 'Persistent Rage',
    slug: 'barbarian-persistent-rage',
    description:
      'Beginning at 15th level, your rage is so fierce that it ends early only if you fall [unconscious](#unconscious) or if you choose to end it.',
    level: 15,
    tags: ['class_barbarian'],
  },
  {
    name: 'Indomitable Might',
    slug: 'barbarian-indomitable-might',
    description:
      'Beginning at 18th level, if your total for a Strength check is less than your Strength score, you can use that score in place of the total.',
    level: 18,
    tags: ['class_barbarian'],
  },
  {
    name: 'Feral Instinct',
    slug: 'barbarian-feral-instinct',
    description:
      "By 7th level, your instincts are so honed that you have advantage on initiative rolls.\n\nAdditionally, if you are surprised at the beginning of combat and aren't [incapacitated](#incapacitated), you can act normally on your first turn, but only if you enter your rage before doing anything else on that turn.",
    level: 1,
    tags: ['class_barbarian'],
  },
  {
    name: 'Fast Movement',
    slug: 'barbarian-fast-movement',
    description: "Starting at 5th level, your speed increases by 10 feet while you aren't wearing heavy armor.",
    level: 5,
    tags: ['class_barbarian'],
  },
  {
    name: 'Extra Attack',
    slug: 'barbarian-extra-attack',
    description:
      'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.',
    level: 5,
    tags: ['class_barbarian'],
  },
  {
    name: 'Danger Sense',
    slug: 'barbarian-danger-sense',
    description:
      "At 2nd level, you gain an uncanny sense of when things nearby aren't as they should be, giving you an edge when you dodge away from danger.\n\nYou have advantage on Dexterity saving throws against effects that you can see, such as traps and spells. To gain this benefit, you can't be [blinded](#blinded), [deafened](#deafened), or [incapacitated](#incapacitated).",
    level: 2,
    tags: ['class_barbarian'],
  },
  {
    name: 'Brutal Critical',
    slug: 'barbarian-brutal-critical',
    description:
      'Beginning at 9th level, you can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack.\n\nThis increases to two additional dice at 13th level and three additional dice at 17th level.',
    level: 9,
    tags: ['class_barbarian'],
  },
  {
    name: 'Ability Score Improvement',
    slug: 'barbarian-ability-score-improvement',
    description:
      "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
    level: 4,
    tags: ['class_barbarian'],
  },
];
