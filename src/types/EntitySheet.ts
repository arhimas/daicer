import { ActionDefinition } from '@/types/ActionDefinition';

export interface EntitySheet {
  /** Strapi Document ID */
  documentId?: string;

  /** Entity Display Name */
  name: string;

  /** Classification */
  type: 'player' | 'monster' | 'npc';

  /** Current Hit Points */
  hp: number;

  /** Maximum Hit Points */
  maxHp: number;

  /** Armor Class (Preferred) */
  ac?: number;

  /** Legacy Armor Class field (deprecate?) */
  armorClass?: number;

  /** Challenge Rating or Character Level */
  level: number;

  /** Experience Points */
  xp: number;

  /** Movement Speeds (e.g. { walk: 30, fly: 60 }) */
  speed: { walk: number; [key: string]: number };

  // Stats & Attributes
  /** Core Attributes (D&D 5e Standard) */
  attributes?: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };

  /** Legacy Stats Object */
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }; // Legacy

  /** Calculated Saving Throw Bonuses */
  savingThrows?: {
    fortitude: number;
    reflex: number;
    will: number;
  };

  /** Skill Modifiers */
  skills?: Record<string, number>;

  // Actions & Features
  /** Hydrated Runtime Actions available to this entity */
  structuredActions?: ActionDefinition[];

  /** Passive or Active Features */
  features?: { name: string; description: string }[];

  /** Active Conditions */
  conditions?: { name: string; [key: string]: unknown }[];

  // Relations (IDs)
  /** Current Room ID */
  room?: string;

  /** Original Monster Template ID */
  monster?: string;

  /** User ID of the owner */
  owner?: string;

  // State
  /** Current Initiative Roll */
  initiative?: number;

  /** Proficiency Bonus (Calculated) */
  proficiencyBonus?: number;

  /** 3D World Position */
  position?: { x: number; y: number; z: number };
}
