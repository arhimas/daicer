import { describe, it, expect, vi } from 'vitest';
import { calculateProficiencyBonus, calculateSkillBonus } from '../skills';
import * as AttributesModule from '../attributes';

// Mock Attributes if needed, but the math is simple enough to integration test.
// However, sticking to strict unit tests:
vi.mock('../attributes', () => ({
  calculateModifier: vi.fn(),
  SKILL_ABILITY_MAP: { perception: 'wisdom', stealth: 'dexterity' }
}));

describe('Skills Derivation', () => {
  describe('calculateProficiencyBonus', () => {
    it.each([
      [1, 2], [4, 2],
      [5, 3], [8, 3],
      [9, 4], [12, 4],
      [13, 5], [16, 5],
      [17, 6], [20, 6]
    ])('should return %i for level %i', (level, expected) => {
      expect(calculateProficiencyBonus(level)).toBe(expected);
    });

    it('should clamp minimum at 2', () => {
      expect(calculateProficiencyBonus(0)).toBe(2);
    });
  });

  describe('calculateSkillBonus', () => {
    const mockStats = { strength: 10, dexterity: 10, wisdom: 10, intelligence: 10, charisma: 10, constitution: 10, passivePerception: 10, initiativeBonus: 0 };

    it('should calculate bonus correctly (Mod + PB * Multiplier)', () => {
      vi.mocked(AttributesModule.calculateModifier).mockReturnValue(3); // +3 mod
      
      // Skill: Perception (Wisdom), Level 1 (PB 2), Proficient (x1)
      // Expect: 3 + (2 * 1) = 5
      const bonus = calculateSkillBonus('perception', 1, mockStats, 2);
      expect(bonus).toBe(5);
    });

    it('should handle expertise (x2)', () => {
      vi.mocked(AttributesModule.calculateModifier).mockReturnValue(1); 
      
      // Skill: Stealth (Dex), Level 5 (PB 3), Expertise (x2)
      // Expect: 1 + (3 * 2) = 7
      const bonus = calculateSkillBonus('stealth', 2, mockStats, 3);
      expect(bonus).toBe(7);
    });

    it('should derive PB from level if missing', () => {
      vi.mocked(AttributesModule.calculateModifier).mockReturnValue(0);
      
      // Level 5 -> PB 3. Proficient (1)
      // 0 + 3 = 3
      const bonus = calculateSkillBonus('perception', 1, mockStats, undefined, 5);
      expect(bonus).toBe(3);
    });

    it('should fallback to 0 mod for unknown skill', () => {
      const bonus = calculateSkillBonus('unknown-skill', 1, mockStats, 2);
      // No ability map -> falls through to return 0 + profBonus
      expect(bonus).toBe(2);
    });
  });
});
