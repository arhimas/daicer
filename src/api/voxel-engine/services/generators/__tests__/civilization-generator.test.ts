import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CivilizationGenerator } from '../civilization-generator';
import { WorldConfig, BlockType } from '@daicer/engine/types';
import { WorldAtlas } from '@daicer/engine/world/world-atlas';

// Mocks
const { MockStructureRenderer, MockAdvancedStructureGenerator, MockAlea } = vi.hoisted(() => {
  return {
    MockStructureRenderer: {
        setBlock: vi.fn(),
        stampBuilding: vi.fn(),
        carveRoom: vi.fn(),
    },
    MockAdvancedStructureGenerator: {
        generate: vi.fn(),
    },
    MockAlea: class {
        next() { return 0.5; }
    }
  };
});

vi.mock('../structure-renderer', () => ({
  StructureRenderer: MockStructureRenderer,
}));

vi.mock('../advanced-structure-generator', () => ({
  AdvancedStructureGenerator: MockAdvancedStructureGenerator,
}));

vi.mock('../../src/utils/math', () => ({
  Alea: MockAlea,
}));

// Mock Atlas
const mockAtlas = {
    getStructureInCell: vi.fn(),
} as unknown as WorldAtlas;

describe('CivilizationGenerator', () => {
    let generator: CivilizationGenerator;
    let config: WorldConfig;
    let tiles: any[][][]; // Mock 3D array

    beforeEach(() => {
        vi.clearAllMocks();
        config = {
            chunkSize: 32,
            structureSpacing: 1,
            roadDensity: 1.0, // Always generate roads
        } as any;
        
        generator = new CivilizationGenerator(config, mockAtlas);
        // Minimal tiles mock: 
        // tiles[z][y][x]
        // We need 6 layers?
        tiles = Array.from({ length: 10 }, () => 
            Array.from({ length: 32 }, () => 
                Array.from({ length: 32 }, () => ({ block: 0 }))
            )
        );
    });

    describe('apply', () => {
        it('should do nothing if no atlas', () => {
            const genNoAtlas = new CivilizationGenerator(config);
            genNoAtlas.apply(0, 0, tiles, 0, 0);
            expect(mockAtlas.getStructureInCell).not.toHaveBeenCalled();
        });

        it('should query atlas and generate structure if matches', () => {
            // Setup Atlas response
            vi.spyOn(mockAtlas, 'getStructureInCell').mockReturnValue({
                type: 'village',
                center: { x: 10, y: 10 },
                seed: 'test-seed',
            } as any);

            // Call apply
            // chunkX=0, chunkY=0. wOffX=0, wOffY=0.
            // regionSize = 32.
            // rx from -1 to 1.
            generator.apply(0, 0, tiles, 0, 0);

            // Expect AdvancedStructureGenerator.generate to be called
            expect(MockAdvancedStructureGenerator.generate).toHaveBeenCalled();
            // Villages map to 'city' (small) -> type check passed?
            // "mappedStruct.type = 'city'"
        });

        it('should ignore "none" structures', () => {
            vi.spyOn(mockAtlas, 'getStructureInCell').mockReturnValue({
                type: 'none',
                center: { x: 0, y: 0 },
                seed: '',
            } as any);

            generator.apply(0, 0, tiles, 0, 0);
            expect(MockAdvancedStructureGenerator.generate).not.toHaveBeenCalled();
        });
    });

    describe('Structure Generation Methods', () => {
        const mockStruct = {
            worldX: 10,
            worldY: 10,
            size: 20,
            seed: 'test',
            type: 'city',
        } as any;

        it('should generate city', () => {
            generator.generateCity(mockStruct, tiles, 0, 0);
            expect(MockStructureRenderer.setBlock).toHaveBeenCalled();
            expect(MockStructureRenderer.stampBuilding).toHaveBeenCalled();
        });
        
        it('should generate castle', () => {
            generator.generateCastle(mockStruct, tiles, 0, 0);
            expect(MockStructureRenderer.stampBuilding).toHaveBeenCalled();
            expect(MockStructureRenderer.setBlock).toHaveBeenCalled(); // Door
        });

        it('should generate tower', () => {
             generator.generateTower(mockStruct, tiles, 0, 0);
             expect(MockStructureRenderer.stampBuilding).toHaveBeenCalled();
             // Stairs
             expect(MockStructureRenderer.setBlock).toHaveBeenCalled();
        });

        it('should generate dungeon', () => {
            generator.generateDungeon(mockStruct, tiles, 0, 0);
            expect(MockStructureRenderer.carveRoom).toHaveBeenCalled();
       });
    });
    
    describe('Road Rasterization (Private via connectStructureToNeighbors)', () => {
        it('should attempt to draw roads', () => {
             // Mock Atlas with neighbors
             vi.spyOn(mockAtlas, 'getStructureInCell').mockImplementation((x, y) => {
                 if (x===0 && y===0) return { type: 'village', center: { x: 5, y: 5 }, seed: 'a' } as any;
                 if (x===1 && y===0) return { type: 'village', center: { x: 25, y: 5 }, seed: 'b' } as any;
                 return null;
             });

             // We need to trigger connectStructureToNeighbors.
             // It's called inside apply loop.
             // We need to ensure we visit rx=0, ry=0.
             
             // To verify road rasterization, we check if tiles are modified?
             // rasterizeRoad modifies `tiles[3][ly][lx]`.
             // But we mocked Alea to return 0.5?
             // Code: `if (rng.next() > this.config.roadDensity) continue;`
             // Config roadDensity = 1.0. 0.5 < 1.0. Should draw.
             
             const spy = vi.spyOn(generator as any, 'rasterizeRoad');
             
             generator.apply(0, 0, tiles, 0, 0);
             
             expect(spy).toHaveBeenCalled();
        });
    });
});
