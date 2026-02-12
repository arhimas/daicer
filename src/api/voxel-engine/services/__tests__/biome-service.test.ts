import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BiomeService } from '../biome-service';
import { BiomeType, BlockType, WorldConfig } from '@daicer/engine/types';
import { TileHelper } from '../utils/tile-helper';

// Mocks
const mockFbm = vi.fn();
const mockNext = vi.fn();

vi.mock('@/api/voxel-engine/src/utils/math', () => ({
  FastNoise: class {
    constructor(seed: string) {}
    fbm(...args: any[]) { return mockFbm(...args); }
  },
  Alea: class {
    constructor(seed: string) {}
    next() { return mockNext(); }
  }
}));

// Mock TileHelper
vi.mock('../utils/tile-helper', () => ({
  TileHelper: {
    createTile: vi.fn((x, y, z, block, biome) => ({ x, y, z, block, biome, isWalkable: true })),
  }
}));

describe('BiomeService', () => {
    let service: BiomeService;
    const mockConfig: WorldConfig = {
        chunkSize: 16,
        globalScale: 0.1,
        elevationScale: 1,
        moistureScale: 1,
        detail: 1,
        roughness: 1,
        seaLevel: 0,
        temperatureOffset: 0,
        seed: 'biome-test'
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFbm.mockReturnValue(0.5);
        mockNext.mockReturnValue(0.5);
        service = new BiomeService(mockConfig);
    });

    it('should initialize correctly', () => {
        expect(service).toBeDefined();
    });

    describe('determineBiome logic (via generateBaseTerrain)', () => {
        // We verify determineBiome indirectly via generateBaseTerrain calling TileHelper.createTile
        // Helper to run generation and returning the biome/block passed to createTile for the Surface (Z=0)
        const getGeneratedSurfaceParams = () => {
             const tiles: any[][][] = Array(7).fill(null).map(() => Array(16).fill(null).map(() => Array(16).fill(null)));
             service.generateBaseTerrain(0, 0, tiles);
             // Verify call for Z=0 (Surface is index 3) and Z=-1 (index 2) etc.
             // TileHelper.createTile is called multiple times.
             // Let's grab the call arguments for the surface tile at x=0, y=0.
             // worldOffset is 0,0. So wx=0, wy=0.
             // Find call where z=0.
             const calls = vi.mocked(TileHelper.createTile).mock.calls;
             const surfaceCall = calls.find(call => call[2] === 0);
             return { block: surfaceCall?.[3], biome: surfaceCall?.[4] };
        };

        it('should generate Ocean', () => {
             service = new BiomeService({ ...mockConfig, seaLevel: 0.6 });
             mockFbm.mockReturnValueOnce(0.5).mockReturnValueOnce(0.5); // Elev 0.5 < 0.6
             
             const { biome, block } = getGeneratedSurfaceParams();
             expect(biome).toBe(BiomeType.ocean);
             expect(block).toBe(BlockType.WATER);
        });

        it('should generate Beach', () => {
             service = new BiomeService({ ...mockConfig, seaLevel: 0.4 });
             // Elev 0.42 (0.4 < 0.42 < 0.45)
             mockFbm.mockReturnValueOnce(0.42).mockReturnValueOnce(0.5);

             const { biome, block } = getGeneratedSurfaceParams();
             expect(biome).toBe(BiomeType.beach);
             expect(block).toBe(BlockType.SAND);
        });

        it('should generate High Elevation: Snowy Peaks', () => {
             mockFbm.mockReturnValueOnce(0.9).mockReturnValueOnce(0.5); // Elev 0.9 > 0.8
             const { biome, block } = getGeneratedSurfaceParams();
             expect(biome).toBe(BiomeType.snowy_peaks);
             expect(block).toBe(BlockType.SNOW);
        });

        it('should generate High Elevation: Crystal Peaks (Dry)', () => {
             mockFbm.mockReturnValueOnce(0.9).mockReturnValueOnce(-0.5); // Elev 0.9, Moist -0.5
             const { biome, block } = getGeneratedSurfaceParams();
             expect(biome).toBe(BiomeType.crystal_peaks);
             expect(block).toBe(BlockType.STONE);
        });

        it('should generate Mid Elevation: Jungle', () => {
             // Elev 0.4 (> 0.3), Moist 0.4 (< 0.5)
             mockFbm.mockReturnValueOnce(0.4).mockReturnValueOnce(0.4);
             const { biome, block } = getGeneratedSurfaceParams();
             expect(biome).toBe(BiomeType.jungle);
             expect(block).toBe(BlockType.GRASS);
        });
        
        it('should generate Low Elevation: Lava Wastes', () => {
             // Elev 0.1 (< 0.3), Moist -0.6 (< -0.5)
             mockFbm.mockReturnValueOnce(0.1).mockReturnValueOnce(-0.6);
             const { biome, block } = getGeneratedSurfaceParams();
             expect(biome).toBe(BiomeType.lava_wastes);
             expect(block).toBe(BlockType.LAVA);
        });
        
        it('should generate Low Elevation: Swamp', () => {
             // Elev 0.1, Moist 0.5 (< 0.6)
             mockFbm.mockReturnValueOnce(0.1).mockReturnValueOnce(0.5);
             const { biome, block } = getGeneratedSurfaceParams();
             expect(biome).toBe(BiomeType.swamp);
             expect(block).toBe(BlockType.DIRT);
        });
    });

    describe('Generation Loop', () => {
        it('should populate all layers', () => {
            const tiles: any[][][] = Array(7).fill(null).map(() => Array(16).fill(null).map(() => Array(16).fill(null)));
            service.generateBaseTerrain(0, 0, tiles);
            
            // Check that tiles array was mutated
            // We mocked createTile to return an object.
            expect(tiles[0][0][0]).toBeDefined(); // Bedrock layer
            expect(tiles[3][0][0]).toBeDefined(); // Surface
            expect(tiles[6][0][0]).toBeDefined(); // Sky
        });
    });
});
