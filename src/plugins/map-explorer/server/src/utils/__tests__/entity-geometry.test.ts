import { describe, it, expect } from 'vitest';
import {
  getPixelDimensions,
  getCellFootprint,
  validateMatrixSize,
  PIXELS_PER_FOOT,
} from '@/plugins/map-explorer/server/src/utils/entity-geometry';

describe('EntityGeometry', () => {
  describe('getPixelDimensions', () => {
    it('should return default (Medium) for null/undefined/empty', () => {
      expect(getPixelDimensions(null)).toBe(1 * PIXELS_PER_FOOT);
      expect(getPixelDimensions(undefined)).toBe(1 * PIXELS_PER_FOOT);
      expect(getPixelDimensions('')).toBe(1 * PIXELS_PER_FOOT);
    });

    it('should return default for unknown sizes', () => {
      expect(getPixelDimensions('colossal')).toBe(1 * PIXELS_PER_FOOT);
    });

    it('should correct pixels for all known sizes', () => {
      // Implementation: feet * 32. Registry has feet: 1 for Medium.
      expect(getPixelDimensions('Tiny')).toBe(1 * PIXELS_PER_FOOT);
      expect(getPixelDimensions('Small')).toBe(1 * PIXELS_PER_FOOT);
      expect(getPixelDimensions('Medium')).toBe(1 * PIXELS_PER_FOOT); // Registry says feet: 1
      expect(getPixelDimensions('Large')).toBe(2 * PIXELS_PER_FOOT);
      expect(getPixelDimensions('Huge')).toBe(3 * PIXELS_PER_FOOT);
      expect(getPixelDimensions('Gargantuan')).toBe(4 * PIXELS_PER_FOOT);
    });

    it('should be case insensitive', () => {
      expect(getPixelDimensions('large')).toBe(2 * PIXELS_PER_FOOT);
      expect(getPixelDimensions('LARGE')).toBe(2 * PIXELS_PER_FOOT);
    });
  });

  describe('getCellFootprint', () => {
    it('should return 1 for null/undefined/empty', () => {
      expect(getCellFootprint(null)).toBe(1);
      expect(getCellFootprint(undefined)).toBe(1);
      expect(getCellFootprint('')).toBe(1);
    });

    it('should return 1 for unknown sizes', () => {
      expect(getCellFootprint('unknown')).toBe(1);
    });

    it('should return correct footprint', () => {
      expect(getCellFootprint('Tiny')).toBe(1);
      expect(getCellFootprint('Medium')).toBe(1);
      expect(getCellFootprint('Large')).toBe(2);
      expect(getCellFootprint('Huge')).toBe(3);
    });
  });

  describe('validateMatrixSize', () => {
    it('should return false if input is not an array', () => {
      expect(validateMatrixSize(null as any, 'Medium')).toBe(false);
      expect(validateMatrixSize({} as any, 'Medium')).toBe(false);
    });

    it('should return false if dimensions do not match size', () => {
      const matrix = [
        [1, 1],
        [1, 1]
      ]; // 2x2
      // Medium is 5 * 32 = 160.  2 != 160.
      expect(validateMatrixSize(matrix, 'Medium')).toBe(false);
    });
    
    it('should return true if dimensions match', () => {
        // Mock a large matrix? 
        // Tiny = 1 * 32 = 32.
        const size = 32;
        const matrix = Array(size).fill(Array(size).fill(0));
        expect(validateMatrixSize(matrix, 'Tiny')).toBe(true);
    });

    it('should fail if width does not match height (ragged or wrong shape)', () => {
         const size = 32;
         const matrix = Array(size).fill(Array(10).fill(0)); // Height 32, Width 10
         expect(validateMatrixSize(matrix, 'Tiny')).toBe(false);
    });
  });
});
