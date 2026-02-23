import { describe, it, expect } from 'vitest';
import { getMovementModes, canMove } from '@/api/game/src/engine/utils/movement';

describe('Movement Utils', () => {
  describe('getMovementModes', () => {
    it('should return zero walk speed for null/undefined', () => {
      expect(getMovementModes(null)).toEqual({ walk: 0 });
      expect(getMovementModes(undefined)).toEqual({ walk: 0 });
    });

    it('should handle number input as walk speed', () => {
      expect(getMovementModes(30)).toEqual({ walk: 30 });
    });

    it('should normalize object input', () => {
      const speed = { walk: 30, fly: 60, hover: true };
      expect(getMovementModes(speed)).toEqual({
        walk: 30,
        fly: 60,
        swim: undefined,
        climb: undefined,
        burrow: undefined,
        hover: true,
      });
    });

    it('should default missing walk to 0 in object', () => {
      expect(getMovementModes({ fly: 10 } as any)).toMatchObject({ walk: 0, fly: 10 });
    });
  });

  describe('canMove', () => {
    it('should check walk capability', () => {
      expect(canMove(30, 'walk')).toBe(true);
      expect(canMove(0, 'walk')).toBe(false);
    });

    it('should check complex capabilities', () => {
      const speed = { walk: 30, fly: 60 };
      expect(canMove(speed, 'fly')).toBe(true);
      expect(canMove(speed, 'swim')).toBe(false);
    });

    it('should check boolean capabilities (hover)', () => {
      const speed = { walk: 0, hover: true };
      expect(canMove(speed, 'hover')).toBe(true);
      const speed2 = { walk: 0, hover: false };
      expect(canMove(speed2, 'hover')).toBe(false);
    });
  });
});
