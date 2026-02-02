import { describe, it, expect } from 'vitest';
import { calculateModifier, calculateProficiencyBonus, createCharacterSnapshot } from '../dnd5e';

describe('DnD 5e Rules', () => {
  describe('calculateModifier', () => {
    it('should calculate standard modifiers correctly', () => {
      expect(calculateModifier(10)).toBe(0);
      expect(calculateModifier(12)).toBe(1);
      expect(calculateModifier(8)).toBe(-1);
      expect(calculateModifier(20)).toBe(5);
      expect(calculateModifier(1)).toBe(-5);
      expect(calculateModifier(30)).toBe(10);
    });

    it('should round down (floor)', () => {
      expect(calculateModifier(11)).toBe(0); // (11-10)/2 = 0.5 -> 0
      expect(calculateModifier(13)).toBe(1); // (13-10)/2 = 1.5 -> 1
      expect(calculateModifier(9)).toBe(-1); // (9-10)/2 = -0.5 -> -1
    });
  });

  describe('calculateProficiencyBonus', () => {
    it('should follow level bracket', () => {
      expect(calculateProficiencyBonus(1)).toBe(2);
      expect(calculateProficiencyBonus(4)).toBe(2);
      expect(calculateProficiencyBonus(5)).toBe(3);
      expect(calculateProficiencyBonus(8)).toBe(3);
      expect(calculateProficiencyBonus(9)).toBe(4);
      expect(calculateProficiencyBonus(12)).toBe(4);
      expect(calculateProficiencyBonus(13)).toBe(5);
      expect(calculateProficiencyBonus(16)).toBe(5);
      expect(calculateProficiencyBonus(17)).toBe(6);
      expect(calculateProficiencyBonus(20)).toBe(6);
    });
  });

  describe('createCharacterSnapshot', () => {
    it('should extract snapshot from valid sheet', () => {
      const sheet = {
        currentHp: 20,
        maxHp: 20,
        level: 3,
        experience: 1000,
        stats: { strength: 16 },
        inventory: [{ name: 'Sword' }],
        position: { x: 1, y: 1, z: 1 },
        // Extra fields ignored
        name: 'Hero',
      };

      const snap = createCharacterSnapshot(sheet as any);
      expect(snap).toEqual({
        hp: 20,
        maxHp: 20,
        level: 3,
        experience: 1000,
        stats: { strength: 16 },
        inventory: [{ name: 'Sword' }],
        position: { x: 1, y: 1, z: 1 },
      });
    });

    it('should handle null sheet', () => {
      expect(createCharacterSnapshot(null as any)).toBeNull();
    });

    it('should provide defaults', () => {
      const snap = createCharacterSnapshot({});
      expect(snap?.level).toBe(1);
      expect(snap?.hp).toBe(10);
      expect(snap?.position).toEqual({ x: 0, y: 0, z: 0 });
    });
  });
});
