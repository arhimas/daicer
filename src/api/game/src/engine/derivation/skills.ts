import { calculateModifier, Attributes, AbilityScore } from '@daicer/engine/derivation/attributes';

export const SKILL_ABILITY_MAP: Record<string, AbilityScore> = {
  acrobatics: 'dexterity',
  animal_handling: 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  sleight_of_hand: 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
};

/**
 * Calculates Proficiency Bonus based on character total level.
 * Formula: ceil(1 + level / 4)
 *
 * - Level 1-4: +2
 * - Level 5-8: +3
 * - Level 9-12: +4
 * - Level 13-16: +5
 * - Level 17-20: +6
 */
export function calculateProficiencyBonus(level: number): number {
  if (level < 1) return 2; // Minimum PB
  return Math.ceil(1 + level / 4);
}

/**
 * Calculates the total bonus for a skill.
 *
 * Formula: Attribute Mod + (Proficiency Bonus * Multiplier)
 * Multiplier: 0 (None), 1 (Proficient), 2 (Expertise), 0.5 (Jack of All Trades - future)
 *
 * @param skillSlug - standard slug (e.g. 'perception')
 * @param proficiencyMultiplier - 0, 1, or 2
 * @param attributes - Character attributes
 * @param proficiencyBonus - Character's PB (optional, derived from level if missing, but level required in that case)
 * @param level - Character's total level (optional, used if PB missing)
 */
export function calculateSkillBonus(
  skillSlug: string,
  proficiencyMultiplier: number,
  attributes: Attributes,
  proficiencyBonus?: number,
  level?: number
): number {
  // Normalize slug
  const normalizedSlug = skillSlug.toLowerCase().replace(/-/g, '_');
  const ability = SKILL_ABILITY_MAP[normalizedSlug];

  let pb = proficiencyBonus;
  if (pb === undefined) {
    pb = calculateProficiencyBonus(level || 1);
  }

  if (!ability) {
    // Fallback or error? defaulting to 0 mod if unknown.
    return 0 + Math.floor(pb * proficiencyMultiplier);
  }

  const mod = calculateModifier(attributes[ability]);
  const profBonus = Math.floor(pb * proficiencyMultiplier);

  return mod + profBonus;
}
