import { EntityStats, EntityAction, EntityFeature, InventoryItem, EntitySpell } from '@daicer/engine/types';

export interface AbstractBlueprint {
  // core identity
  name: string;
  type: 'monster' | 'player' | 'npc';

  // logic
  level: number;
  stats: EntityStats;

  // combat internals
  maxHp: number;
  armorClass: number;
  speed: number;

  // capabilities
  actions: EntityAction[];
  spells: EntitySpell[]; // Flat list of known/prepared spells available to cast
  features: EntityFeature[];
  inventory: InventoryItem[];

  // defenses
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];

  // senses
  visionRadius: number;

  // meta
  originalData?: unknown; // The source Strapi object for reference
}
