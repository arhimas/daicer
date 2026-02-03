import { EntitySheet } from '@daicer/engine/types';

/**
 * Represents the Global Rule Configuration (from Strapi api::rule-set).
 * Defines scale tables for XP and Proficiency.
 */
export interface RuleSet {
  xp_table: number[];
  proficiency_table: { [level: string]: number }; // Strapi might return string keys
  full_caster_slots: { [level: string]: number[] };
  ability_caps?: { [key: string]: number }; // e.g. "default": 20, "barbarian_20": 24
}

export interface ClassProgression {
  level: number;
  features: { documentId?: string; name: string }[]; // Strict relation stub
  spell_slots?: number[];
  class_specifics?: Record<string, unknown>;
}

export interface ClassDefinition {
  name: string;
  hit_die: string;
  progression: ClassProgression[];
  // ... other fields like description, image etc can be ignored for engine logic
}

export interface LevelUpContext {
  sheet: EntitySheet;
  classDefinition: ClassDefinition;
  ruleSet: RuleSet;
}
