import { Attributes } from './attributes';
export { Attributes };

/**
 * Represents an item in an inventory during derivation.
 */
export interface Equipment {
  name: string;
  equipment_category?: {
    slug: string;
  };
  damage_dice?: string;
  damage_type?: {
    name: string;
    slug?: string;
  };
  range_normal?: number;
  range_long?: number;
  properties?: Array<{
    name: string;
    slug: string;
  }>;
  armor_class_base?: number;
  armor_class_dex_bonus?: boolean;
  str_minimum?: number;
  stealth_disadvantage?: boolean;
  isEquipped?: boolean;
  actions?: import('./types').RuntimeAction[]; // Use import type or moved type to avoid circular dep if needed, or just RuntimeAction if in same file
}

export interface DerivationContext {
  attributes: Attributes;
  // Multiclass support:
  classes?: Array<{
    name: string;
    level: number;
    hitDie?: string;
  }>;
  // Legacy / Monster support:
  level?: number;
  isMonster?: boolean;
  type?: string;

  proficiencyBonus?: number; // Optional override
  equipment: Equipment[];
  hitDie?: number; // e.g., 8, 10, 12
  race?: {
    speed?: number | { walk: number; [key: string]: number };
  };
  // Innate actions (from blueprint/JSON) to be merged with equipment actions
  innateActions?: RuntimeAction[];

  // Overrides allowed in context
  ac?: number;
  hp?: number;
  maxHp?: number;
  speed?: number | { walk: number; [key: string]: number };
  actions?: RuntimeAction[];
  // Alias for legacy support
  stats?: Attributes;
  spells?: RuntimeAction[];
  spellcastingAbility?: string;
}

export interface RuntimeEffect {
  type: 'damage' | 'healing' | 'apply_condition';
  subtype?: string;
  dice?: string;
  flat?: number;
  paramAttribute?: string;
  timing?: string;
  duration?: number;
  chance?: number;
}

export interface RuntimeAction {
  id: string;
  name: string;
  type?: string;
  sourceType?: string;
  sourceId?: string;
  description?: string;
  img?: string;

  cost?: {
    type: 'action_economy' | 'slot' | 'resource';
    amount: number;
    actionType: 'action' | 'bonus' | 'reaction';
    resourceId?: string;
  };

  range?: {
    type: 'melee' | 'ranged' | 'touch' | 'self';
    value: number;
    reach?: number;
  };

  aoe?: {
    shape: string;
    size: number;
    height?: number;
  };

  attack?: {
    type: string;
    bonus: number;
    critRange?: number;
  };

  save?: {
    attribute: string;
    dc: number;
    effect?: string;
  };

  effects?: RuntimeEffect[];
}
