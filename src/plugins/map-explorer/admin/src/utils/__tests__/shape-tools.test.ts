import { describe, it, expect } from 'vitest';
import { getShapePixels } from "../shape-tools";

describe('Shape Tools', () => {
  describe('getShapePixels', () => {
    describe('Rectangle', () => {
      it('should generate pixels for a 1x1 rectangle', () => {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 0, y: 0 };
        const pixels = getShapePixels(p1, p2, 'rect');
        expect(pixels).toHaveLength(1);
        expect(pixels[0]).toEqual({ x: 0, y: 0 });
      });

      it('should generate pixels for a 2x2 rectangle', () => {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 1, y: 1 };
        const pixels = getShapePixels(p1, p2, 'rect');
        expect(pixels).toHaveLength(4);
        expect(pixels).toEqual(
          expect.arrayContaining([
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
          ])
        );
      });

      it('should handle negative coordinates order', () => {
        const p1 = { x: 1, y: 1 };
        const p2 = { x: 0, y: 0 };
        const pixels = getShapePixels(p1, p2, 'rect');
        expect(pixels).toHaveLength(4);
      });
    });

    describe('Circle', () => {
      it('should generate pixels for a small circle', () => {
        // A circle with radius ~0.5 (diameter 1)
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 0, y: 0 };
        // Center 0,0. Radius 0.
        // Logic: centerX=0, centerY=0, radiusX=0, radiusY=0.
        // This effectively might produce 1 pixel or none depending on <= 1.0 check with division by 0.5.
        // wait, radiusX = (0-0)/2 = 0.
        // normalizedX = (x - 0) / (0 + 0.5) = x * 2.
        // if x=0: 0 <= 1. Correct.
        const pixels = getShapePixels(p1, p2, 'circle');
        expect(pixels).toContainEqual({ x: 0, y: 0 });
      });

      it('should generate pixels within a circular bound', () => {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 4, y: 4 }; // Diameter 4? Center 2,2. Radius 2.
        const pixels = getShapePixels(p1, p2, 'circle');

        // Center (2, 2). Radius 2.
        // Corners (0,0), (4,0), (0,4), (4,4).
        // Distance from center (2,2) to corner (0,0) is sqrt(2^2 + 2^2) = sqrt(8) ≈ 2.82 > 2.
        // So corners should NOT be included.
        // Midpoints like (2,0) -> dist 2. Included.

        expect(pixels).not.toContainEqual({ x: 0, y: 0 });
        expect(pixels).toContainEqual({ x: 2, y: 2 }); // Center
        expect(pixels).toContainEqual({ x: 2, y: 0 }); // Edge top
        expect(pixels).toContainEqual({ x: 4, y: 2 }); // Edge right
      });
    });
  });
});
