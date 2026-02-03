import { EntityFeature } from '@daicer/engine/types';

/**
 * Defines the structure of a Character Class (Game System Level).
 * Used for leveling up and feature distribution.
 */
export interface ClassDefinition {
  name: string;
  hitDie: 'd6' | 'd8' | 'd10' | 'd12';
  savingThrows: string[]; // ['Dexterity', 'Intelligence']

  /**
   * Returns features granted at a specific level.
   */
  getFeatures(level: number): EntityFeature[];

  /**
   * Returns the progression table (slots etc) - simplified for now
   */
  // getProgression(level: number): any;
}
