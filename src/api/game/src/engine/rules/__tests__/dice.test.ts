import { describe, it, expect } from 'vitest';
import { parseDiceString, roll } from '@daicer/engine/rules/dice';

describe('Dice Engine', () => {
  describe('parseDiceString', () => {
    it('should parse standard notation', () => {
      const def = parseDiceString('2d6+4');
      expect(def).toEqual({ count: 2, sides: 6, bonus: 4 });
    });

    it('should parse no bonus', () => {
      const def = parseDiceString('1d20');
      expect(def).toEqual({ count: 1, sides: 20, bonus: 0 });
    });

    it('should handle whitespace', () => {
      const def = parseDiceString(' 3 d 8 + 2 ');
      expect(def).toEqual({ count: 3, sides: 8, bonus: 2 });
    });

    it('should throw on invalid format', () => {
      expect(() => parseDiceString('invalid')).toThrow();
    });
  });

  describe('roll', () => {
    it('should use provided RNG', () => {
      // Mock RNG that returns 0.99 (highest roll)
      // 2d6: Math.floor(0.99 * 6) + 1 = 6.
      const rng = () => 0.99;
      const res = roll({ count: 2, sides: 6, bonus: 1 }, rng);

      expect(res.rolls).toEqual([6, 6]);
      expect(res.total).toBe(13); // 6+6+1
    });

    it('should detect critical hits on d20', () => {
      const rngHits = () => 0.99; // 20
      const resHit = roll({ count: 1, sides: 20, bonus: 0 }, rngHits);
      expect(resHit.isCritical).toBe(true);

      const rngMiss = () => 0.5; // 11
      const resMiss = roll({ count: 1, sides: 20, bonus: 0 }, rngMiss);
      expect(resMiss.isCritical).toBe(false);
    });

    it('should detect critical fail on d20', () => {
      const rngFail = () => 0.0; // 0 * 20 = 0 -> +1 = 1
      const res = roll({ count: 1, sides: 20, bonus: 0 }, rngFail);
      expect(res.isCriticalFail).toBe(true);
    });
  });
});
