import { ActionDefinition } from './ActionDefinition';

export interface EntitySheet {
  documentId?: string;
  name: string;
  type: 'player' | 'monster' | 'npc';
  hp: number;
  maxHp: number;
  ac?: number;
  armorClass?: number;
  level: number;
  xp: number;
  speed: { walk: number; [key: string]: number };

  // Stats & Attributes
  attributes?: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }; // Legacy
  savingThrows?: {
    fortitude: number;
    reflex: number;
    will: number;
  };
  skills?: Record<string, number>;

  // Actions & Features
  structuredActions?: ActionDefinition[];
  features?: { name: string; description: string }[];
  conditions?: { name: string; [key: string]: unknown }[];

  // Relations (IDs)
  room?: string;
  monster?: string;
  character?: string;
  owner?: string;

  // State
  initiative?: number;
  proficiencyBonus?: number;
  position?: { x: number; y: number; z: number };
}
