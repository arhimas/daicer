"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const compositor_1 = require("../compositor");
// Helpers
const createGrid = (size, fill = null) => Array(size).fill(null).map(() => Array(size).fill(fill));
const createZoneGrid = (size, fill = 'none') => Array(size).fill(null).map(() => Array(size).fill(fill));
(0, vitest_1.describe)('Compositor Utility (Dynamic Geometry)', () => {
    (0, vitest_1.describe)('getVisualBounds', () => {
        (0, vitest_1.it)('should correctly identify bounds in a 32x32 grid', () => {
            const grid = createGrid(32);
            grid[10][10] = '#fff';
            grid[20][20] = '#fff';
            const bounds = (0, compositor_1.getVisualBounds)(grid);
            (0, vitest_1.expect)(bounds).not.toBeNull();
            if (bounds) {
                (0, vitest_1.expect)(bounds.minX).toBe(10);
                (0, vitest_1.expect)(bounds.maxX).toBe(20);
                (0, vitest_1.expect)(bounds.minY).toBe(10);
                (0, vitest_1.expect)(bounds.maxY).toBe(20);
                (0, vitest_1.expect)(bounds.cx).toBe(15);
                (0, vitest_1.expect)(bounds.cy).toBe(15);
            }
        });
        (0, vitest_1.it)('should correctly identify bounds in a 64x64 grid', () => {
            const grid = createGrid(64);
            grid[10][10] = '#fff';
            grid[50][50] = '#fff';
            const bounds = (0, compositor_1.getVisualBounds)(grid);
            (0, vitest_1.expect)(bounds).not.toBeNull();
            if (bounds) {
                (0, vitest_1.expect)(bounds.minX).toBe(10);
                (0, vitest_1.expect)(bounds.maxX).toBe(50);
                (0, vitest_1.expect)(bounds.minY).toBe(10);
                (0, vitest_1.expect)(bounds.maxY).toBe(50);
                (0, vitest_1.expect)(bounds.cx).toBe(30);
                (0, vitest_1.expect)(bounds.cy).toBe(30);
            }
        });
        (0, vitest_1.it)('should return null for empty grid', () => {
            const grid = createGrid(32);
            (0, vitest_1.expect)((0, compositor_1.getVisualBounds)(grid)).toBeNull();
        });
    });
    (0, vitest_1.describe)('getZoneCentroid', () => {
        (0, vitest_1.it)('should find centroid of a zone in 32x32', () => {
            const grid = createZoneGrid(32);
            // Draw a 2x2 box at 10,10
            grid[10][10] = 'head';
            grid[10][11] = 'head';
            grid[11][10] = 'head';
            grid[11][11] = 'head';
            const centroid = (0, compositor_1.getZoneCentroid)(grid, 'head');
            (0, vitest_1.expect)(centroid).not.toBeNull();
            if (centroid) {
                (0, vitest_1.expect)(centroid.x).toBe(11); // Rounding logic check
                (0, vitest_1.expect)(centroid.y).toBe(11);
            }
        });
        (0, vitest_1.it)('should find centroid of a zone in 64x64', () => {
            const grid = createZoneGrid(64);
            grid[32][32] = 'core';
            const centroid = (0, compositor_1.getZoneCentroid)(grid, 'core');
            (0, vitest_1.expect)(centroid).toEqual(vitest_1.expect.objectContaining({ x: 32, y: 32 }));
        });
    });
    (0, vitest_1.describe)('compositeLoadout', () => {
        (0, vitest_1.it)('should composite two 32x32 layers', () => {
            const baseGrid = createGrid(32);
            baseGrid[16][16] = '#base';
            // Mock blueprint showing center anchor
            const baseBlueprint = createZoneGrid(32);
            baseBlueprint[16][16] = 'core';
            const baseAsset = {
                pixelData: baseGrid,
                blueprint: baseBlueprint,
                archetype: 'Humanoid'
            };
            const overlayGrid = createGrid(32);
            overlayGrid[16][16] = '#overlay';
            const overlayBlueprint = createZoneGrid(32);
            overlayBlueprint[16][16] = 'core';
            const overlayAsset = {
                pixelData: overlayGrid,
                blueprint: overlayBlueprint,
                archetype: 'Body Armor'
            };
            const result = (0, compositor_1.compositeLoadout)(baseAsset, [overlayAsset]);
            (0, vitest_1.expect)(result.grid[16][16]).toBe('#overlay');
        });
        (0, vitest_1.it)('should handle different sized layers (clamping)', () => {
            // In current implementation, we just clamp. 
            // This test ensures no crash.
            const baseGrid = createGrid(64);
            const baseBlueprint = createZoneGrid(64);
            const baseAsset = {
                pixelData: baseGrid,
                blueprint: baseBlueprint,
                archetype: 'Humanoid'
            };
            const overlayGrid = createGrid(32); // Smaller overlay
            const overlayBlueprint = createZoneGrid(32);
            const overlayAsset = {
                pixelData: overlayGrid,
                blueprint: overlayBlueprint,
                archetype: 'Accessory'
            };
            const result = (0, compositor_1.compositeLoadout)(baseAsset, [overlayAsset]);
            (0, vitest_1.expect)(result.grid.length).toBe(64); // Should respect base size
        });
        (0, vitest_1.it)('should blend semi-transparent pixels', () => {
            const baseGrid = createGrid(32);
            // Red Background
            baseGrid[16][16] = 'rgba(255, 0, 0, 1)';
            const baseAsset = {
                pixelData: baseGrid,
                blueprint: createZoneGrid(32, 'core'),
                archetype: 'Humanoid'
            };
            const overlayGrid = createGrid(32);
            // 50% Blue Overlay
            overlayGrid[16][16] = 'rgba(0, 0, 255, 0.5)';
            const overlayAsset = {
                pixelData: overlayGrid,
                blueprint: createZoneGrid(32, 'core'),
                archetype: 'Body Armor'
            };
            const result = (0, compositor_1.compositeLoadout)(baseAsset, [overlayAsset]);
            const blended = result.grid[16][16];
            // parseColor floors 0.5 * 255 -> 127.
            // AlphaSrc = 127/255 (~0.498)
            // Result is opaque (A=255) so returns Hex.
            // R = 128 (80), G = 0, B = 127 (7f)
            (0, vitest_1.expect)(blended).toBe('#80007f');
        });
    });
});
