import { describe, it, expect } from 'vitest';
import { calculateDistance, isPointInRadius, isPointInCone } from '@/api/game/src/engine/utils/geometry';

describe('Geometry Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate euclidean distance correctly', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 3, y: 4, z: 0 };
      expect(calculateDistance(p1, p2)).toBe(5);
    });

    it('should handle 3D distance', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 1, y: 2, z: 2 };
      expect(calculateDistance(p1, p2)).toBe(3);
    });
  });

  describe('isPointInRadius', () => {
    it('should return true if inside radius', () => {
      const origin = { x: 0, y: 0, z: 0 };
      const point = { x: 2, y: 0, z: 0 };
      expect(isPointInRadius(origin, point, 5)).toBe(true);
    });

    it('should return false if outside radius', () => {
      const origin = { x: 0, y: 0, z: 0 };
      const point = { x: 6, y: 0, z: 0 };
      expect(isPointInRadius(origin, point, 5)).toBe(false);
    });
  });

  describe('isPointInCone', () => {
    const origin = { x: 0, y: 0, z: 0 };
    const direction = { x: 0, y: 5, z: 0 }; // Facing +Y
    const range = 10;
    const angle = 90; // 90 degrees total, 45 each side

    it('should return true for point directly in front', () => {
      const point = { x: 0, y: 2, z: 0 };
      expect(isPointInCone(origin, direction, point, range, angle)).toBe(true);
    });

    it('should return false for point out of range', () => {
      const point = { x: 0, y: 11, z: 0 };
      expect(isPointInCone(origin, direction, point, range, angle)).toBe(false);
    });

    it('should return true for point within angle', () => {
      // 45 degrees relative to Y axis is X=Y.
      // Point at (2, 2) is exactly 45 deg? No, atan2(2,2) is 45 deg from X axis?
      // Wait, geometry implementation uses crossproduct logic.
      // Let's test basic quadrants.
      // Facing +Y (0, 5).
      // Point (1, 5) is slightly right. Should be in 90 deg cone.
      expect(isPointInCone(origin, direction, { x: 1, y: 5, z: 0 }, range, angle)).toBe(true);
    });

    it('should return false for point outside angle', () => {
      // Facing +Y. Point at (-5, 0) is -X (90 deg left). Total 90 deg cone is +/- 45.
      // So -X should be outside.
      expect(isPointInCone(origin, direction, { x: -5, y: 0, z: 0 }, range, angle)).toBe(false);
    });

    it('should return false for point behind', () => {
      expect(isPointInCone(origin, direction, { x: 0, y: -2, z: 0 }, range, angle)).toBe(false);
    });
  });
});
