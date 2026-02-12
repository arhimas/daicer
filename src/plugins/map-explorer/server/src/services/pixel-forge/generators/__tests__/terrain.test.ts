import { describe, it, expect } from 'vitest';
import { generateTerrainGrid, synthesizeTerrainBlueprint } from '../terrain';
import { TerrainContext } from '@/plugins/map-explorer/server/src/services/pixel-forge/serializers';

describe('Terrain Generator', () => {
    describe('generateTerrainGrid', () => {
        it('should generate grid with correct dimensions', () => {
            const ctx: TerrainContext = {
                width: 10,
                isLiquid: false,
                isTransparent: true,
                noiseConfig: { seed: 123, scale: 10 }
            };
            const grid = generateTerrainGrid(ctx);
            expect(grid.length).toBe(10);
            expect(grid[0].length).toBe(10);
        });

        it('should use liquid colors when isLiquid is true', () => {
            const ctx: TerrainContext = {
                width: 10,
                isLiquid: true, // Water colors
                isTransparent: true,
                noiseConfig: { seed: 123, scale: 2 } // Small scale for noise
            };
            const grid = generateTerrainGrid(ctx);
            // Flatten and check for liquid colors #4682b4 or #5f9ea0
            const flat = grid.flat();
            const hasWater = flat.some(c => c === '#4682b4' || c === '#5f9ea0');
            expect(hasWater).toBe(true);
        });

        it('should fill gaps if not transparent', () => {
             const ctx: TerrainContext = {
                width: 5,
                isLiquid: false,
                isTransparent: false, // Solid bedrock
                noiseConfig: { seed: 123, scale: 100 } // High scale -> constant noise
            };
            const grid = generateTerrainGrid(ctx);
            const flat = grid.flat();
            // Should contain bedrock #000000 where noise was low (null)
            // or just ensure no nulls
            const hasNull = flat.some(c => c === null);
            expect(hasNull).toBe(false);
        });
    });

    describe('synthesizeTerrainBlueprint', () => {
        it('should map pixels to terrain zones', () => {
            const pixels = [
                ['#fff', null],
                [null, '#fff']
            ];
            const ctx: TerrainContext = { width: 2, isLiquid: false, isTransparent: true };
            
            const zones = synthesizeTerrainBlueprint(pixels, ctx);
            
            expect(zones[0][0]).toBe('terrain');
            expect(zones[0][1]).toBeNull();
            expect(zones[1][0]).toBeNull();
            expect(zones[1][1]).toBe('terrain');
        });

        it('should map liquid to hazard zones', () => {
             const pixels = [['#fff']];
             const ctx: TerrainContext = { width: 1, isLiquid: true, isTransparent: true };
             
             const zones = synthesizeTerrainBlueprint(pixels, ctx);
             expect(zones[0][0]).toBe('hazard');
        });
    });
});
