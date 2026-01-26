import { EntityStats, EntitySheet } from '../types'; // Adjusted relative path to sibling directory (engine/types)
import { SerializedItem, SerializedSpell } from './ActionHydrator';

export { EntityStats };

export interface DerivationContext {
  stats: EntityStats | Record<string, number>;
  attributes: EntityStats | Record<string, number>; // Alias usually
  proficiencyBonus: number;
  level: number;
  equipment: SerializedItem[];
  
  // Entity Context used by derivation pipeline logic
  // Race can be simple string (name) or object with traits
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  race?: string | { speed?: number | { walk: number; [key: string]: number }; [key: string]: any };
  classes?: { name: string; level: number }[];
  spells?: SerializedSpell[];
  innateActions?: RuntimeAction[]; // or raw
  actions?: RuntimeAction[];
  
  // Vitals
  hp?: number;
  maxHp?: number;
  ac?: number;
  hitDie?: string | number; // Allow number if already parsed or string "1d8"
  speed?: number | { walk: number; [key: string]: number };
  
  // Classification
  isMonster?: boolean;
  type?: string;

  // Spellcasting
  spellcastingAbility?: string;
}

// Conflict resolution: Attributes is exported by attributes.ts, avoid re-exporting alias here
// export type Attributes = EntityStats; 

// Validation Context for Hydration Dry Runs in Compilers
export const createValidationContext = (): DerivationContext => ({
  stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10, passivePerception: 10, initiativeBonus: 0 },
  attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10, passivePerception: 10, initiativeBonus: 0 },
  proficiencyBonus: 2,
  spellcastingAbility: 'intelligence',
  level: 1,
  equipment: [],
  isMonster: false,
});

// Alias for legacy or graphQL compatibility
export type Equipment = SerializedItem;

// Computed Runtime Action (Engine) - Distinct from Stored EntityAction (Schema)
export interface RuntimeAction {
  id: string;
  name: string;
  sourceType: 'weapon' | 'spell' | 'feature' | 'item' | 'improvisation';
  sourceId?: string | number;
  description?: string;
  img?: string;

  cost?: {
    type: 'action_economy' | 'slot' | 'resource';
    amount: number;
    resourceId?: string;
    actionType: 'action' | 'bonus' | 'reaction' | 'movement' | 'free';
  };

  range?: {
    type: 'melee' | 'ranged' | 'touch' | 'self';
    value: number;
    reach?: number; // Helpers for UI, though value usually contains it for melee
  };

  aoe?: {
    shape: 'sphere' | 'cone' | 'cube' | 'line' | 'cylinder';
    size: number;
    height?: number;
  };

  attack?: {
    type: 'melee_weapon' | 'ranged_weapon' | 'melee_spell' | 'ranged_spell';
    bonus: number;
    critRange?: number;
  };

  save?: {
    attribute: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
    dc: number;
    effect: 'none' | 'half' | 'negate';
  };

  effects?: Array<{
    type: 'damage' | 'healing' | 'apply_condition';
    subtype?: string; // e.g. 'fire' or 'Prone'
    dice?: string;
    flat?: number;
    paramAttribute?: string; // 'str', 'dex' (for damage bonus calculation)
    timing?: string;
    duration?: number;
    chance?: number;
  }>;
  
  // Storage for original entity properties if needed for logic (like Finesse)
  properties?: string[];
  
  // Spell/Feature Metadata
  concentration?: boolean;
  level?: number; // Convenience for spell level (mirrors cost.amount usually)
  originalRange?: string; // String representation for UI or legacy checks
}

