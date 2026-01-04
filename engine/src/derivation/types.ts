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
}

export interface DerivationContext {
  attributes: Attributes;
  level: number;
  proficiencyBonus: number;
  equipment: Equipment[];
  hitDie?: number; // e.g., 8, 10, 12
  race?: {
    speed?: number | { walk: number; [key: string]: number };
  };
}
