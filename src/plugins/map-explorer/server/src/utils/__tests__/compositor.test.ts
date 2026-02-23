import { describe, it, expect } from 'vitest';
import {
  getVisualBounds,
  getZoneCentroid,
  compositeLoadout,
  AssetStub,
  ZoneType,
} from '@/plugins/map-explorer/server/src/utils/compositor';

// Helpers
const createGrid = (size: number, fill: string | null = null): string[][] =>
  Array(size)
    .fill(null)
    .map(() => Array(size).fill(fill));

const createZoneGrid = (size: number, fill: ZoneType = 'none'): ZoneType[][] =>
  Array(size)
    .fill(null)
    .map(() => Array(size).fill(fill));

describe('Compositor Utility (Dynamic Geometry)', () => {
  describe('getVisualBounds', () => {
    it('should correctly identify bounds in a 32x32 grid', () => {
      const grid = createGrid(32);
      grid[10][10] = '#fff';
      grid[20][20] = '#fff';

      const bounds = getVisualBounds(grid);
      expect(bounds).not.toBeNull();
      if (bounds) {
        expect(bounds.minX).toBe(10);
        expect(bounds.maxX).toBe(20);
        expect(bounds.minY).toBe(10);
        expect(bounds.maxY).toBe(20);
        expect(bounds.cx).toBe(15);
        expect(bounds.cy).toBe(15);
      }
    });

    it('should correctly identify bounds in a 64x64 grid', () => {
      const grid = createGrid(64);
      grid[10][10] = '#fff';
      grid[50][50] = '#fff';

      const bounds = getVisualBounds(grid);
      expect(bounds).not.toBeNull();
      if (bounds) {
        expect(bounds.minX).toBe(10);
        expect(bounds.maxX).toBe(50);
        expect(bounds.minY).toBe(10);
        expect(bounds.maxY).toBe(50);
        expect(bounds.cx).toBe(30);
        expect(bounds.cy).toBe(30);
      }
    });

    it('should return null for empty grid', () => {
      const grid = createGrid(32);
      expect(getVisualBounds(grid)).toBeNull();
    });
  });

  describe('getZoneCentroid', () => {
    it('should find centroid of a zone in 32x32', () => {
      const grid = createZoneGrid(32);
      // Draw a 2x2 box at 10,10
      grid[10][10] = 'head';
      grid[10][11] = 'head';
      grid[11][10] = 'head';
      grid[11][11] = 'head';

      const centroid = getZoneCentroid(grid, 'head');
      expect(centroid).not.toBeNull();
      if (centroid) {
        expect(centroid.x).toBe(11); // Rounding logic check
        expect(centroid.y).toBe(11);
      }
    });

    it('should find centroid of a zone in 64x64', () => {
      const grid = createZoneGrid(64);
      grid[32][32] = 'core';
      const centroid = getZoneCentroid(grid, 'core');
      expect(centroid).toEqual(expect.objectContaining({ x: 32, y: 32 }));
    });
  });

  describe('compositeLoadout', () => {
    it('should composite two 32x32 layers', () => {
      const baseGrid = createGrid(32);
      baseGrid[16][16] = '#base';

      // Mock blueprint showing center anchor
      const baseBlueprint = createZoneGrid(32);
      baseBlueprint[16][16] = 'core';

      const baseAsset: AssetStub = {
        pixelData: baseGrid,
        blueprint: baseBlueprint,
        archetype: 'Humanoid',
      };

      const overlayGrid = createGrid(32);
      overlayGrid[16][16] = '#overlay';
      const overlayBlueprint = createZoneGrid(32);
      overlayBlueprint[16][16] = 'core';

      const overlayAsset: AssetStub = {
        pixelData: overlayGrid,
        blueprint: overlayBlueprint,
        archetype: 'Body Armor',
      };

      const result = compositeLoadout(baseAsset, [overlayAsset]);

      expect(result.grid[16][16]).toBe('#overlay');
    });

    it('should handle different sized layers (clamping)', () => {
      // In current implementation, we just clamp.
      // This test ensures no crash.
      const baseGrid = createGrid(64);
      const baseBlueprint = createZoneGrid(64);

      const baseAsset: AssetStub = {
        pixelData: baseGrid,
        blueprint: baseBlueprint,
        archetype: 'Humanoid',
      };

      const overlayGrid = createGrid(32); // Smaller overlay
      const overlayBlueprint = createZoneGrid(32);

      const overlayAsset: AssetStub = {
        pixelData: overlayGrid,
        blueprint: overlayBlueprint,
        archetype: 'Accessory',
      };

      const result = compositeLoadout(baseAsset, [overlayAsset]);
      expect(result.grid.length).toBe(64); // Should respect base size
    });

    it('should blend semi-transparent pixels', () => {
      const baseGrid = createGrid(32);
      // Red Background
      baseGrid[16][16] = 'rgba(255, 0, 0, 1)';

      const baseAsset: AssetStub = {
        pixelData: baseGrid,
        blueprint: createZoneGrid(32, 'core'),
        archetype: 'Humanoid',
      };

      const overlayGrid = createGrid(32);
      // 50% Blue Overlay
      overlayGrid[16][16] = 'rgba(0, 0, 255, 0.5)';

      const overlayAsset: AssetStub = {
        pixelData: overlayGrid,
        blueprint: createZoneGrid(32, 'core'),
        archetype: 'Body Armor',
      };

      const result = compositeLoadout(baseAsset, [overlayAsset]);
      const blended = result.grid[16][16];

      // parseColor floors 0.5 * 255 -> 127.
      // AlphaSrc = 127/255 (~0.498)
      // Result is opaque (A=255) so returns Hex.
      // R = 128 (80), G = 0, B = 127 (7f)
      expect(blended).toBe('#80007f');
    });
  });
});
