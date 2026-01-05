import { Attributes } from './attributes';

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

  proficiencyBonus?: number; // Optional override
  equipment: Equipment[];
  hitDie?: number; // e.g., 8, 10, 12
  race?: {
    speed?: number | { walk: number; [key: string]: number };
  };
  // Innate actions (from blueprint/JSON) to be merged with equipment actions
  innateActions?: any[];

  // Overrides allowed in context
  ac?: number;
  hp?: number;
  maxHp?: number;
  speed?: number | { walk: number; [key: string]: number };
  actions?: any[];
}
