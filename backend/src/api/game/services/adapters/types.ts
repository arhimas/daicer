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
  school?: string | { name: string; documentId: string }; // Enum or Relation? Schema says enum but could be relation in practice
  casting_config?: {
    time_unit?: string;
    casting_time?: string;
    components?: string; // "V, S" etc
  };
  range_config?: {
    type?: string;
    distance?: number;
    aoe_shape?: string;
    aoe_size?: number;
    aoe_height?: number;
  };
  duration_config?: {
    type?: string;
    duration_rounds?: number;
    concentration?: boolean;
  };
  mechanics_config?: {
    action_type?: string;
    save_effect?: string;
  };
  damage_instances?: {
    effect_type: string;
    damage_type: string;
    dice_count: number;
    dice_value: number;
    flat_bonus?: number;
    timing?: string;
  }[];
  condition_instances?: {
    condition: string;
    duration_rounds: number;
    chance: number;
  }[];
  description?: string;
  image?: { url: string };
  // Legacy fields fallback
  casting_time?: string;
  range?: string | { type?: string; distance?: number };
  components?: string;
  duration?: string;
  concentration?: boolean;
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

  // V5 Schema Structure
  damage_instances?: {
    effect_type: string;
    damage_type: string;
    dice_count: number;
    dice_value: number;
    flat_bonus?: number;
    timing?: string;
  }[];
  range_config?: {
    type?: string;
    distance?: number;
    aoe_shape?: string;
    aoe_size?: number;
  };
  save?: { dc?: number; stat?: string; success_type?: string };

  // Legacy/Engine fields
  damage?: {
    id: string | number;
    dice: string;
    bonus?: number;
    type: string;
  }[];
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

export interface StrapiCharacter {
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
  inventory?: StrapiInventoryItem[];
  actions?: StrapiAction[];
  spells?: StrapiSpell[];
}

export interface StrapiEntity {
  documentId: string;
  name: string;
  type?: string; // "beast", "plant" etc
  level?: number;
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
  spells?: StrapiSpell[];
  inventory?: StrapiInventoryItem[];
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
  character?: StrapiCharacter;
  entity?: StrapiEntity;

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
