import { describe, it, expect } from 'vitest';
import {
  getPixelDimensions,
  getCellFootprint,
  validateMatrixSize,
  PIXELS_PER_FOOT,
  SIZE_REGISTRY,
} from '@/utils/entity-geometry';

describe('EntityGeometry', () => {
  describe('Constants', () => {
    it('should define the Golden Ratio as 32 pixels per foot', () => {
      expect(PIXELS_PER_FOOT).toBe(32);
    });

    it('should have immutable size registry', () => {
      expect(Object.isFrozen(SIZE_REGISTRY)).toBe(true);
    });
  });

  describe('getPixelDimensions', () => {
    it('should return 32px for Tiny/Small/Medium (1ft)', () => {
      expect(getPixelDimensions('tiny')).toBe(32);
      expect(getPixelDimensions('small')).toBe(32);
      expect(getPixelDimensions('medium')).toBe(32);
    });

    it('should return 64px for Large (2ft)', () => {
      expect(getPixelDimensions('large')).toBe(64);
    });

    it('should return 96px for Huge (3ft)', () => {
      expect(getPixelDimensions('huge')).toBe(96);
    });

    it('should return 128px for Gargantuan (4ft)', () => {
      expect(getPixelDimensions('gargantuan')).toBe(128);
    });

    it('should be case insensitive', () => {
      expect(getPixelDimensions('LARGE')).toBe(64);
      expect(getPixelDimensions('HuGe')).toBe(96);
    });

    it('should default to Medium (32px) for null/undefined/invalid', () => {
      expect(getPixelDimensions(null)).toBe(32);
      expect(getPixelDimensions(undefined)).toBe(32);
      expect(getPixelDimensions('not-a-real-size')).toBe(32);
      expect(getPixelDimensions('')).toBe(32);
    });
  });

  describe('getCellFootprint', () => {
    it('should return 1 cell for Tiny/Small/Medium', () => {
      expect(getCellFootprint('tiny')).toBe(1);
      expect(getCellFootprint('medium')).toBe(1);
    });

    it('should return 2 cells for Large', () => {
      expect(getCellFootprint('large')).toBe(2);
    });

    it('should return 3 cells for Huge', () => {
      expect(getCellFootprint('huge')).toBe(3);
    });

    it('should return 4 cells for Gargantuan', () => {
      expect(getCellFootprint('gargantuan')).toBe(4);
    });

    it('should default to 1 cell for invalid inputs', () => {
      expect(getCellFootprint(null)).toBe(1);
      expect(getCellFootprint('unknown')).toBe(1);
    });
  });

  describe('validateMatrixSize', () => {
    it('should validate correct dimensions', () => {
      const size32 = Array(32).fill(Array(32).fill('#000'));
      expect(validateMatrixSize(size32, 'medium')).toBe(true);

      const size64 = Array(64).fill(Array(64).fill('#000'));
      expect(validateMatrixSize(size64, 'large')).toBe(true);
    });

    it('should reject incorrect row count', () => {
      const size32 = Array(32).fill(Array(32).fill('#000'));
      expect(validateMatrixSize(size32, 'large')).toBe(false); // Expecting 64
    });

    it('should reject incorrect column count', () => {
      // 32 rows, but each row is only 10px wide
      const malformed = Array(32).fill(Array(10).fill('#000'));
      expect(validateMatrixSize(malformed, 'medium')).toBe(false);
    });

    it('should handle non-array inputs safely', () => {
      expect(validateMatrixSize(null as any, 'medium')).toBe(false);
      expect(validateMatrixSize(undefined as any, 'medium')).toBe(false);
      expect(validateMatrixSize('string' as any, 'medium')).toBe(false);
      expect(validateMatrixSize([], 'medium')).toBe(false); // Empty array 0 !== 32
    });
  });
});
