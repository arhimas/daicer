export interface StrapiComponentStats {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  passivePerception?: number;
  initiativeBonus?: number;
}

export interface StrapiInventoryItem {
  id: string | number;
  quantity: number;
  slot: string;
  isEquipped: boolean;
  item?: {
    documentId: string;
    name: string;
    description?: string;
    value?: number;
    weight?: number;
    rarity?: string;
    type?: string;
    [key: string]: unknown;
  };
}

export interface StrapiSpell {
  documentId: string;
  name: string;
  level: number;
  school?: { name: string; documentId: string };
  casting_time?: string;
  range?: string;
  components?: string; // V, S, M
  duration?: string;
  concentration?: boolean;
  ritual?: boolean;
  description?: string;
  damage?: { dice: string; type: string }[];
}

export interface StrapiSpellbook {
  id: string | number;
  knownSpells?: StrapiSpell[];
  preparedSpells?: StrapiSpell[];
  spellcastingAbility?: string;
  spellSaveDc?: number;
  spellAttackBonus?: number;
  slots?: {
    level1?: number;
    level2?: number;
    level3?: number;
    level4?: number;
    level5?: number;
  };
  concentratingOn?: unknown;
}

export interface StrapiAction {
  documentId: string;
  name: string;
  type?: 'melee' | 'ranged' | 'melee_attack' | 'ranged_attack' | 'spell' | 'utility' | 'heal' | 'support';
  toHit?: number;
  damage?: {
    id: string | number;
    dice: string;
    bonus?: number;
    type: string;
  }[];
  save?: { dc?: number; stat?: string };
  area?: { type: string; size: number };
  range?: number | string; // 60 or "60/120"
  description?: string;
  properties?: string; // "Finesse, Light" etc.

  // Relations
  action_definition?: {
    documentId: string;
    name: string;
  };
}

export interface StrapiFeature {
  documentId: string;
  name: string;
  description?: string;
  level?: number;
  type?: 'class' | 'race' | 'feat';
  source?: string; // "Rogue: 1", "Elf"
}

export interface StrapiProficiency {
  documentId: string;
  name: string;
  type?: string; // "Armor", "Weapon", "Tool", "Skill"
  attribute?: string; // For skills: "Wisdom"
}

export interface StrapiLanguage {
  documentId: string;
  name: string;
  is_rare?: boolean;
  script?: string;
}

export interface StrapiEntitySheet {
  documentId: string;
  name: string;
  type: 'player' | 'monster' | 'npc';

  // Vitals
  currentHp?: number;
  maxHp?: number;
  ac?: number;
  armorClass?: number; // Legacy/Blueprint fallback
  speed?: number;

  // Relations/Blueprints
  character?: {
    documentId: string;
    name: string;
    stats?: StrapiComponentStats;
    classes?: {
      name: string;
      level: number;
      subclass?: string;
    }[];
    race?: {
      name: string;
      speed?: number;
      size?: string;
    };
    background?: string;
  };
  monster?: {
    documentId: string;
    name: string; // "Goblin"
    stats?: StrapiComponentStats;
    ac?: number;
    hp?: number;
    challenge_rating?: number;
    actions?: StrapiAction[];
    features?: StrapiFeature[];
    resistances?: string[];
    immunities?: string[];
    vulnerabilities?: string[];
    speed?: number;
  };

  // Components
  stats?: StrapiComponentStats;
  inventory?: StrapiInventoryItem[];
  spellbook?: StrapiSpellbook;

  // Direct Relations
  actions?: StrapiAction[];
  proficiencies?: StrapiProficiency[];
  languages?: StrapiLanguage[];
  traits?: StrapiFeature[]; // Merged with features in UI usually
  features?: StrapiFeature[];

  // Misc
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  conditions?: { documentId: string; name: string }[];

  position?: { x: number; y: number; z: number };
  color?: string;

  // Catch-all safety
  [key: string]: unknown;
}
