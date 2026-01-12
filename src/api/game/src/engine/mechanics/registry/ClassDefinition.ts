import { EntityFeature } from '../../types';

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
