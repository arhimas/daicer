import { describe, it, expect } from 'vitest';
import visibilityServiceFactory from '../visibility-service';

describe('VisibilityService', () => {
    const mockStrapi = {} as any;
    const visibilityService = visibilityServiceFactory({ strapi: mockStrapi });

    describe('getVisibleChunkCoords', () => {
        it('should return 3x3 grid of chunks around center', () => {
            // Chunks are 16x16.
            // Center at 16,16 is chunk 1,1
            const center = { x: 16, y: 16, z: 0 };
            const chunks = visibilityService.getVisibleChunkCoords(center);
            
            // Should be 9 chunks: (0,0) to (2,2)
            expect(chunks).toHaveLength(9);
            expect(chunks).toContainEqual({ x: 0, y: 0 });
            expect(chunks).toContainEqual({ x: 1, y: 1 }); // center
            expect(chunks).toContainEqual({ x: 2, y: 2 });
        });

        it('should handle negative coordinates', () => {
            // Center at -16, -16 is chunk -1, -1
            const center = { x: -16, y: -16, z: 0 };
            const chunks = visibilityService.getVisibleChunkCoords(center);
            expect(chunks).toContainEqual({ x: -1, y: -1 });
            expect(chunks).toContainEqual({ x: -2, y: -2 });
            expect(chunks).toContainEqual({ x: 0, y: 0 });
        });
    });

    describe('isEntityVisible', () => {
        it('should return true if within radius', () => {
            const observer = { x: 0, y: 0, z: 0 };
            const target = { x: 10, y: 10, z: 0 }; // dist ~14.14 < 20
            expect(visibilityService.isEntityVisible(observer, target)).toBe(true);
        });

        it('should return false if outside radius', () => {
            const observer = { x: 0, y: 0, z: 0 };
            const target = { x: 20, y: 10, z: 0 }; // dist ~22.36 > 20
            expect(visibilityService.isEntityVisible(observer, target)).toBe(false);
        });

        it('should return false if z-level diff > 10', () => {
            const observer = { x: 0, y: 0, z: 0 };
            const target = { x: 0, y: 0, z: 11 };
            expect(visibilityService.isEntityVisible(observer, target)).toBe(false);
        });

        it('should return true if z-level diff <= 10', () => {
            const observer = { x: 0, y: 0, z: 0 };
            const target = { x: 0, y: 0, z: 10 };
            expect(visibilityService.isEntityVisible(observer, target)).toBe(true);
        });
    });

    describe('cullEntities', () => {
        it('should filter out invisible entities', () => {
            const observer = { x: 0, y: 0, z: 0 };
            const entities = [
                { position: { x: 5, y: 5, z: 0 } },   // Visible
                { position: { x: 50, y: 50, z: 0 } }, // Invisible
                { character: { position: { x: 5, y: 5, z: 0 } } }, // Visible via character
            ];

            const result = visibilityService.cullEntities(observer, entities);
            expect(result).toHaveLength(2);
            expect(result[0]).toBe(entities[0]);
            expect(result[1]).toBe(entities[2]);
        });

        it('should default to 0,0,0 if position missing', () => {
            const observer = { x: 0, y: 0, z: 0 };
            const entities = [{}]; // Defaults to 0,0,0 -> Visible
            const result = visibilityService.cullEntities(observer, entities);
            expect(result).toHaveLength(1);
        });
    });
});
