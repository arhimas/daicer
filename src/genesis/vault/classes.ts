import { SeedClass } from '@/genesis/schemas/molecules';

export const CLASSES: SeedClass[] = [
  {
    slug: 'wizard',
    name: 'Wizard',
    hit_die: 'd6',
    proficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light-crossbows', 'intelligence', 'wisdom'],
    progression: [
      {
        level: 1,
        features: ['wizard-spellcasting', 'wizard-arcane-recovery'],
      },
      {
        level: 2,
        features: ['wizard-arcane-tradition'],
      },
      {
        level: 3,
        features: [],
      },
      {
        level: 4,
        features: ['wizard-ability-score-improvement'],
      },
      {
        level: 5,
        features: [],
      },
      {
        level: 6,
        features: ['wizard-arcane-tradition-feature'],
      },
      {
        level: 7,
        features: [],
      },
      {
        level: 8,
        features: ['wizard-ability-score-improvement'],
      },
      {
        level: 9,
        features: [],
      },
      {
        level: 10,
        features: ['wizard-arcane-tradition-feature'],
      },
      {
        level: 11,
        features: [],
      },
      {
        level: 12,
        features: ['wizard-ability-score-improvement'],
      },
      {
        level: 13,
        features: [],
      },
      {
        level: 14,
        features: ['wizard-arcane-tradition-feature'],
      },
      {
        level: 15,
        features: [],
      },
      {
        level: 16,
        features: ['wizard-ability-score-improvement'],
      },
      {
        level: 17,
        features: [],
      },
      {
        level: 18,
        features: ['wizard-spell-mastery'],
      },
      {
        level: 19,
        features: ['wizard-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['wizard-signature-spells'],
      },
    ],
    description: 'Character Class: Wizard',
  },
  {
    slug: 'warlock',
    name: 'Warlock',
    hit_die: 'd8',
    proficiencies: ['light-armor', 'simple-weapons', 'wisdom', 'charisma'],
    progression: [
      {
        level: 1,
        features: ['warlock-otherworldly-patron', 'warlock-pact-magic'],
      },
      {
        level: 2,
        features: ['warlock-eldritch-invocations'],
      },
      {
        level: 3,
        features: ['warlock-pact-boon'],
      },
      {
        level: 4,
        features: ['warlock-ability-score-improvement'],
      },
      {
        level: 5,
        features: [],
      },
      {
        level: 6,
        features: ['warlock-otherworldly-patron-feature'],
      },
      {
        level: 7,
        features: [],
      },
      {
        level: 8,
        features: ['warlock-ability-score-improvement'],
      },
      {
        level: 9,
        features: [],
      },
      {
        level: 10,
        features: ['warlock-otherworldly-patron-feature'],
      },
      {
        level: 11,
        features: ['warlock-mystic-arcanum'],
      },
      {
        level: 12,
        features: ['warlock-ability-score-improvement'],
      },
      {
        level: 13,
        features: ['warlock-mystic-arcanum'],
      },
      {
        level: 14,
        features: ['warlock-otherworldly-patron-feature'],
      },
      {
        level: 15,
        features: ['warlock-mystic-arcanum'],
      },
      {
        level: 16,
        features: ['warlock-ability-score-improvement'],
      },
      {
        level: 17,
        features: ['warlock-mystic-arcanum'],
      },
      {
        level: 18,
        features: [],
      },
      {
        level: 19,
        features: ['warlock-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['warlock-eldritch-master'],
      },
    ],
    description: 'Character Class: Warlock',
  },
  {
    slug: 'sorcerer',
    name: 'Sorcerer',
    hit_die: 'd6',
    proficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light-crossbows', 'constitution', 'charisma'],
    progression: [
      {
        level: 1,
        features: ['sorcerer-spellcasting', 'sorcerer-sorcerous-origin'],
      },
      {
        level: 2,
        features: ['sorcerer-font-of-magic'],
      },
      {
        level: 3,
        features: ['sorcerer-metamagic'],
      },
      {
        level: 4,
        features: ['sorcerer-ability-score-improvement'],
      },
      {
        level: 5,
        features: [],
      },
      {
        level: 6,
        features: ['sorcerer-sorcerous-origin-feature'],
      },
      {
        level: 7,
        features: [],
      },
      {
        level: 8,
        features: ['sorcerer-ability-score-improvement'],
      },
      {
        level: 9,
        features: [],
      },
      {
        level: 10,
        features: ['sorcerer-metamagic'],
      },
      {
        level: 11,
        features: [],
      },
      {
        level: 12,
        features: ['sorcerer-ability-score-improvement'],
      },
      {
        level: 13,
        features: [],
      },
      {
        level: 14,
        features: ['sorcerer-sorcerous-origin-feature'],
      },
      {
        level: 15,
        features: [],
      },
      {
        level: 16,
        features: ['sorcerer-ability-score-improvement'],
      },
      {
        level: 17,
        features: ['sorcerer-metamagic'],
      },
      {
        level: 18,
        features: ['sorcerer-sorcerous-origin-feature'],
      },
      {
        level: 19,
        features: ['sorcerer-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['sorcerer-sorcerous-restoration'],
      },
    ],
    description: 'Character Class: Sorcerer',
  },
  {
    slug: 'rogue',
    name: 'Rogue',
    hit_die: 'd8',
    proficiencies: [
      'light-armor',
      'simple-weapons',
      'hand-crossbows',
      'longswords',
      'rapiers',
      'shortswords',
      'thieves-tools',
      'dexterity',
      'intelligence',
    ],
    progression: [
      {
        level: 1,
        features: ['rogue-expertise', 'rogue-sneak-attack', 'rogue-thieves-cant'],
      },
      {
        level: 2,
        features: ['rogue-cunning-action'],
      },
      {
        level: 3,
        features: ['rogue-roguish-archetype'],
      },
      {
        level: 4,
        features: ['rogue-ability-score-improvement'],
      },
      {
        level: 5,
        features: ['rogue-uncanny-dodge'],
      },
      {
        level: 6,
        features: ['rogue-expertise'],
      },
      {
        level: 7,
        features: ['rogue-evasion'],
      },
      {
        level: 8,
        features: ['rogue-ability-score-improvement'],
      },
      {
        level: 9,
        features: ['rogue-roguish-archetype-feature'],
      },
      {
        level: 10,
        features: ['rogue-ability-score-improvement'],
      },
      {
        level: 11,
        features: ['rogue-reliable-talent'],
      },
      {
        level: 12,
        features: ['rogue-ability-score-improvement'],
      },
      {
        level: 13,
        features: ['rogue-roguish-archetype-feature'],
      },
      {
        level: 14,
        features: ['rogue-blindsense'],
      },
      {
        level: 15,
        features: ['rogue-slippery-mind'],
      },
      {
        level: 16,
        features: ['rogue-ability-score-improvement'],
      },
      {
        level: 17,
        features: ['rogue-roguish-archetype-feature'],
      },
      {
        level: 18,
        features: ['rogue-elusive'],
      },
      {
        level: 19,
        features: ['rogue-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['rogue-stroke-of-luck'],
      },
    ],
    description: 'Character Class: Rogue',
  },
  {
    slug: 'ranger',
    name: 'Ranger',
    hit_die: 'd10',
    proficiencies: [
      'light-armor',
      'medium-armor',
      'shields',
      'simple-weapons',
      'martial-weapons',
      'strength',
      'dexterity',
    ],
    progression: [
      {
        level: 1,
        features: ['ranger-favored-enemy', 'ranger-natural-explorer'],
      },
      {
        level: 2,
        features: ['ranger-fighting-style', 'ranger-spellcasting'],
      },
      {
        level: 3,
        features: ['ranger-ranger-archetype', 'ranger-primeval-awareness'],
      },
      {
        level: 4,
        features: ['ranger-ability-score-improvement'],
      },
      {
        level: 5,
        features: ['ranger-extra-attack'],
      },
      {
        level: 6,
        features: ['ranger-favored-enemy', 'ranger-natural-explorer'],
      },
      {
        level: 7,
        features: ['ranger-ranger-archetype-feature'],
      },
      {
        level: 8,
        features: ['ranger-ability-score-improvement', 'ranger-lands-stride'],
      },
      {
        level: 9,
        features: [],
      },
      {
        level: 10,
        features: ['ranger-natural-explorer', 'ranger-hide-in-plain-sight'],
      },
      {
        level: 11,
        features: ['ranger-ranger-archetype-feature'],
      },
      {
        level: 12,
        features: ['ranger-ability-score-improvement'],
      },
      {
        level: 13,
        features: [],
      },
      {
        level: 14,
        features: ['ranger-favored-enemy', 'ranger-vanish'],
      },
      {
        level: 15,
        features: ['ranger-ranger-archetype-feature'],
      },
      {
        level: 16,
        features: ['ranger-ability-score-improvement'],
      },
      {
        level: 17,
        features: [],
      },
      {
        level: 18,
        features: ['ranger-feral-senses'],
      },
      {
        level: 19,
        features: ['ranger-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['ranger-foe-slayer'],
      },
    ],
    description: 'Character Class: Ranger',
  },
  {
    slug: 'paladin',
    name: 'Paladin',
    hit_die: 'd10',
    proficiencies: ['all-armor', 'shields', 'simple-weapons', 'martial-weapons', 'wisdom', 'charisma'],
    progression: [
      {
        level: 1,
        features: ['paladin-divine-sense', 'paladin-lay-on-hands'],
      },
      {
        level: 2,
        features: ['paladin-fighting-style', 'paladin-spellcasting', 'paladin-divine-smite'],
      },
      {
        level: 3,
        features: ['paladin-divine-health', 'paladin-sacred-oath'],
      },
      {
        level: 4,
        features: ['paladin-ability-score-improvement'],
      },
      {
        level: 5,
        features: ['paladin-extra-attack'],
      },
      {
        level: 6,
        features: ['paladin-aura-of-protection'],
      },
      {
        level: 7,
        features: ['paladin-sacred-oath-feature'],
      },
      {
        level: 8,
        features: ['paladin-ability-score-improvement'],
      },
      {
        level: 9,
        features: [],
      },
      {
        level: 10,
        features: ['paladin-aura-of-courage'],
      },
      {
        level: 11,
        features: ['paladin-improved-divine-smite'],
      },
      {
        level: 12,
        features: ['paladin-ability-score-improvement'],
      },
      {
        level: 13,
        features: [],
      },
      {
        level: 14,
        features: ['paladin-cleansing-touch'],
      },
      {
        level: 15,
        features: ['paladin-sacred-oath-feature'],
      },
      {
        level: 16,
        features: ['paladin-ability-score-improvement'],
      },
      {
        level: 17,
        features: [],
      },
      {
        level: 18,
        features: ['paladin-aura-of-protection'],
      },
      {
        level: 19,
        features: ['paladin-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['paladin-sacred-oath-feature'],
      },
    ],
    description: 'Character Class: Paladin',
  },
  {
    slug: 'monk',
    name: 'Monk',
    hit_die: 'd8',
    proficiencies: [
      'simple-weapons',
      'shortswords',
      'choose-one-type-of-artisans-tools-or-one-musical-instrument',
      'strength',
      'dexterity',
    ],
    progression: [
      {
        level: 1,
        features: ['monk-unarmored-defense', 'monk-martial-arts'],
      },
      {
        level: 2,
        features: ['monk-ki', 'monk-unarmored-movement'],
      },
      {
        level: 3,
        features: ['monk-monastic-tradition', 'monk-deflect-missiles'],
      },
      {
        level: 4,
        features: ['monk-ability-score-improvement', 'monk-slow-fall'],
      },
      {
        level: 5,
        features: ['monk-extra-attack', 'monk-stunning-strike'],
      },
      {
        level: 6,
        features: ['monk-ki-empowered-strikes', 'monk-monastic-tradition-feature'],
      },
      {
        level: 7,
        features: ['monk-evasion', 'monk-stillness-of-mind'],
      },
      {
        level: 8,
        features: ['monk-ability-score-improvement'],
      },
      {
        level: 9,
        features: ['monk-unarmored-movement'],
      },
      {
        level: 10,
        features: ['monk-purity-of-body'],
      },
      {
        level: 11,
        features: ['monk-monastic-tradition-feature'],
      },
      {
        level: 12,
        features: ['monk-ability-score-improvement'],
      },
      {
        level: 13,
        features: ['monk-tongue-of-the-sun-and-moon'],
      },
      {
        level: 14,
        features: ['monk-diamond-soul'],
      },
      {
        level: 15,
        features: ['monk-timeless-body'],
      },
      {
        level: 16,
        features: ['monk-ability-score-improvement'],
      },
      {
        level: 17,
        features: ['monk-monastic-tradition-feature'],
      },
      {
        level: 18,
        features: ['monk-empty-body'],
      },
      {
        level: 19,
        features: ['monk-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['monk-perfect-self'],
      },
    ],
    description: 'Character Class: Monk',
  },
  {
    slug: 'fighter',
    name: 'Fighter',
    hit_die: 'd10',
    proficiencies: ['all-armor', 'shields', 'simple-weapons', 'martial-weapons', 'strength', 'constitution'],
    progression: [
      {
        level: 1,
        features: ['fighter-fighting-style', 'fighter-second-wind'],
      },
      {
        level: 2,
        features: ['fighter-action-surge'],
      },
      {
        level: 3,
        features: ['fighter-martial-archetype'],
      },
      {
        level: 4,
        features: ['fighter-ability-score-improvement'],
      },
      {
        level: 5,
        features: ['fighter-extra-attack'],
      },
      {
        level: 6,
        features: ['fighter-ability-score-improvement'],
      },
      {
        level: 7,
        features: ['fighter-martial-archetype-feature'],
      },
      {
        level: 8,
        features: ['fighter-ability-score-improvement'],
      },
      {
        level: 9,
        features: ['fighter-indomitable'],
      },
      {
        level: 10,
        features: ['fighter-martial-archetype-feature'],
      },
      {
        level: 11,
        features: ['fighter-extra-attack'],
      },
      {
        level: 12,
        features: ['fighter-ability-score-improvement'],
      },
      {
        level: 13,
        features: ['fighter-indomitable'],
      },
      {
        level: 14,
        features: ['fighter-ability-score-improvement'],
      },
      {
        level: 15,
        features: ['fighter-martial-archetype-feature'],
      },
      {
        level: 16,
        features: ['fighter-ability-score-improvement'],
      },
      {
        level: 17,
        features: ['fighter-action-surge', 'fighter-indomitable'],
      },
      {
        level: 18,
        features: ['fighter-martial-archetype-feature'],
      },
      {
        level: 19,
        features: ['fighter-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['fighter-extra-attack'],
      },
    ],
    description: 'Character Class: Fighter',
  },
  {
    slug: 'druid',
    name: 'Druid',
    hit_die: 'd8',
    proficiencies: [
      'light-armor',
      'medium-armor',
      'shields-druids-will-not-wear-armor-or-use-shields-made-of-metal',
      'clubs',
      'daggers',
      'darts',
      'javelins',
      'maces',
      'quarterstaffs',
      'scimitars',
      'sickles',
      'slings',
      'spears',
      'herbalism-kit',
      'intelligence',
      'wisdom',
    ],
    progression: [
      {
        level: 1,
        features: ['druid-druidic', 'druid-spellcasting'],
      },
      {
        level: 2,
        features: ['druid-wild-shape', 'druid-druid-circle'],
      },
      {
        level: 3,
        features: [],
      },
      {
        level: 4,
        features: ['druid-wild-shape', 'druid-ability-score-improvement'],
      },
      {
        level: 5,
        features: [],
      },
      {
        level: 6,
        features: ['druid-druid-circle-feature'],
      },
      {
        level: 7,
        features: [],
      },
      {
        level: 8,
        features: ['druid-wild-shape', 'druid-ability-score-improvement'],
      },
      {
        level: 9,
        features: [],
      },
      {
        level: 10,
        features: ['druid-druid-circle-feature'],
      },
      {
        level: 11,
        features: [],
      },
      {
        level: 12,
        features: ['druid-ability-score-improvement'],
      },
      {
        level: 13,
        features: [],
      },
      {
        level: 14,
        features: ['druid-druid-circle-feature'],
      },
      {
        level: 15,
        features: [],
      },
      {
        level: 16,
        features: ['druid-ability-score-improvement'],
      },
      {
        level: 17,
        features: [],
      },
      {
        level: 18,
        features: ['druid-timeless-body', 'druid-beast-spells'],
      },
      {
        level: 19,
        features: ['druid-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['druid-archdruid'],
      },
    ],
    description: 'Character Class: Druid',
  },
  {
    slug: 'cleric',
    name: 'Cleric',
    hit_die: 'd8',
    proficiencies: ['light-armor', 'medium-armor', 'shields', 'simple-weapons', 'wisdom', 'charisma'],
    progression: [
      {
        level: 1,
        features: ['cleric-spellcasting', 'cleric-divine-domain'],
      },
      {
        level: 2,
        features: ['cleric-channel-divinity', 'cleric-divine-domain-feature'],
      },
      {
        level: 3,
        features: [],
      },
      {
        level: 4,
        features: ['cleric-ability-score-improvement'],
      },
      {
        level: 5,
        features: ['cleric-destroy-undead'],
      },
      {
        level: 6,
        features: ['cleric-channel-divinity', 'cleric-divine-domain-feature'],
      },
      {
        level: 7,
        features: [],
      },
      {
        level: 8,
        features: ['cleric-ability-score-improvement', 'cleric-destroy-undead', 'cleric-divine-domain-feature'],
      },
      {
        level: 9,
        features: [],
      },
      {
        level: 10,
        features: ['cleric-divine-intervention'],
      },
      {
        level: 11,
        features: ['cleric-destroy-undead'],
      },
      {
        level: 12,
        features: ['cleric-ability-score-improvement'],
      },
      {
        level: 13,
        features: [],
      },
      {
        level: 14,
        features: ['cleric-destroy-undead'],
      },
      {
        level: 15,
        features: [],
      },
      {
        level: 16,
        features: ['cleric-ability-score-improvement'],
      },
      {
        level: 17,
        features: ['cleric-destroy-undead', 'cleric-divine-domain-feature'],
      },
      {
        level: 18,
        features: ['cleric-channel-divinity'],
      },
      {
        level: 19,
        features: ['cleric-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['cleric-divine-intervention'],
      },
    ],
    description: 'Character Class: Cleric',
  },
  {
    slug: 'bard',
    name: 'Bard',
    hit_die: 'd8',
    proficiencies: [
      'light-armor',
      'simple-weapons',
      'hand-crossbows',
      'longswords',
      'rapiers',
      'shortswords',
      'three-musical-instruments-of-your-choice',
      'dexterity',
      'charisma',
    ],
    progression: [
      {
        level: 1,
        features: ['bard-spellcasting', 'bard-bardic-inspiration'],
      },
      {
        level: 2,
        features: ['bard-jack-of-all-trades', 'bard-song-of-rest'],
      },
      {
        level: 3,
        features: ['bard-bard-college', 'bard-expertise'],
      },
      {
        level: 4,
        features: ['bard-ability-score-improvement'],
      },
      {
        level: 5,
        features: ['bard-bardic-inspiration', 'bard-font-of-inspiration'],
      },
      {
        level: 6,
        features: ['bard-countercharm', 'bard-bard-college-feature'],
      },
      {
        level: 7,
        features: [],
      },
      {
        level: 8,
        features: ['bard-ability-score-improvement'],
      },
      {
        level: 9,
        features: ['bard-song-of-rest'],
      },
      {
        level: 10,
        features: ['bard-bardic-inspiration', 'bard-expertise', 'bard-magical-secrets'],
      },
      {
        level: 11,
        features: [],
      },
      {
        level: 12,
        features: ['bard-ability-score-improvement'],
      },
      {
        level: 13,
        features: ['bard-song-of-rest'],
      },
      {
        level: 14,
        features: ['bard-magical-secrets', 'bard-bard-college-feature'],
      },
      {
        level: 15,
        features: ['bard-bardic-inspiration'],
      },
      {
        level: 16,
        features: ['bard-ability-score-improvement'],
      },
      {
        level: 17,
        features: ['bard-song-of-rest'],
      },
      {
        level: 18,
        features: ['bard-magical-secrets'],
      },
      {
        level: 19,
        features: ['bard-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['bard-superior-inspiration'],
      },
    ],
    description: 'Character Class: Bard',
  },
  {
    slug: 'barbarian',
    name: 'Barbarian',
    hit_die: 'd12',
    proficiencies: [
      'light-armor',
      'medium-armor',
      'shields',
      'simple-weapons',
      'martial-weapons',
      'strength',
      'constitution',
    ],
    progression: [
      {
        level: 1,
        features: ['barbarian-rage', 'barbarian-unarmored-defense'],
      },
      {
        level: 2,
        features: ['barbarian-reckless-attack', 'barbarian-danger-sense'],
      },
      {
        level: 3,
        features: ['barbarian-primal-path'],
      },
      {
        level: 4,
        features: ['barbarian-ability-score-improvement'],
      },
      {
        level: 5,
        features: ['barbarian-extra-attack', 'barbarian-fast-movement'],
      },
      {
        level: 6,
        features: ['barbarian-path-feature'],
      },
      {
        level: 7,
        features: ['barbarian-feral-instinct'],
      },
      {
        level: 8,
        features: ['barbarian-ability-score-improvement'],
      },
      {
        level: 9,
        features: ['barbarian-brutal-critical'],
      },
      {
        level: 10,
        features: ['barbarian-path-feature'],
      },
      {
        level: 11,
        features: ['barbarian-relentless-rage'],
      },
      {
        level: 12,
        features: ['barbarian-ability-score-improvement'],
      },
      {
        level: 13,
        features: ['barbarian-brutal-critical'],
      },
      {
        level: 14,
        features: ['barbarian-path-feature'],
      },
      {
        level: 15,
        features: ['barbarian-persistent-rage'],
      },
      {
        level: 16,
        features: ['barbarian-ability-score-improvement'],
      },
      {
        level: 17,
        features: ['barbarian-brutal-critical'],
      },
      {
        level: 18,
        features: ['barbarian-indomitable-might'],
      },
      {
        level: 19,
        features: ['barbarian-ability-score-improvement'],
      },
      {
        level: 20,
        features: ['barbarian-primal-champion'],
      },
    ],
    description: 'Character Class: Barbarian',
  },
];
