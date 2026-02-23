import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FloraGenerator } from '@/api/voxel-engine/services/generators/flora-generator';
import { BlockType } from '@daicer/engine/types';
import { Alea } from '@/api/voxel-engine/src/utils/math';

// Hoisted mock for Alea
const { mockNext } = vi.hoisted(() => {
  return {
    mockNext: vi.fn(),
  };
});

// Mock the module using the specific alias used in source
vi.mock('@/api/voxel-engine/src/utils/math', () => ({
  Alea: class {
    constructor(_seed: string) {}
    next() {
      return mockNext();
    }
  },
}));

describe('FloraGenerator', () => {
  let tiles: any[][][];

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext.mockReturnValue(0.5); // Default

    // Create 16x16x32 chunk
    tiles = Array.from({ length: 32 }, (_, _z) =>
      Array.from({ length: 16 }, (_, _y) =>
        Array.from({ length: 16 }, (_, _x) => ({
          block: BlockType.AIR,
          isWalkable: false,
          isTransparent: true,
          biome: 'plains',
        }))
      )
    );
  });

  const runGenerate = (type: BlockType, rngVal = 0.5) => {
    mockNext.mockReturnValue(rngVal);
    // Use the imported (and mocked) Alea class
    const rng = new Alea('test');
    FloraGenerator.generate(tiles, 0, 0, 8, 8, 10, type, rng);
  };

  describe('Tree Generation', () => {
    it('should generate Oak (Generic)', () => {
      runGenerate(BlockType.TREE_OAK);
      // Z=10 passed. z+3 implemented = 13.
      expect(tiles[13][8][8].block).toBe(BlockType.TREE_OAK);
      // h=5. leaves at z+h-2 = 13 + 5 - 2 = 16.
      expect(tiles[16][8][8].block).toBe(BlockType.TREE_LEAVES);
    });

    it('should generate Palm', () => {
      runGenerate(BlockType.TREE_PALM);
      expect(tiles[13][8][8].block).toBe(BlockType.TREE_PALM);
      // Height logic: Base 4 + floor(0.5*3) = 5.
      // Palm logic: height + 4 = 9.
      // Trunk z=10. + 9 = 19. +Offset 3 = 22.
      expect(tiles[22][8][8].block).toBe(BlockType.TREE_LEAVES);
    });

    it('should generate Pine', () => {
      runGenerate(BlockType.TREE_PINE);
      expect(tiles[13][8][8].block).toBe(BlockType.TREE_PINE);
    });

    it('should generate Baobab', () => {
      runGenerate(BlockType.TREE_BAOBAB);
      expect(tiles[13][8][8].block).toBe(BlockType.TREE_BAOBAB);
      expect(tiles[13][9][8].block).toBe(BlockType.TREE_BAOBAB);
    });

    it('should generate Willow', () => {
      runGenerate(BlockType.TREE_WILLOW);
      expect(tiles[13][8][8].block).toBe(BlockType.TREE_WILLOW);
    });

    it('should generate Bamboo', () => {
      runGenerate(BlockType.TREE_BAMBOO_GIANT);
      expect(tiles[13][8][8].block).toBe(BlockType.TREE_BAMBOO_GIANT);
    });
  });

  describe('Plant & Rock Generation', () => {
    it('should generate Cactus', () => {
      runGenerate(BlockType.PLANT_CACTUS);
      expect(tiles[13][8][8].block).toBe(BlockType.CACTUS);
    });

    it('should generate Pumpkin', () => {
      runGenerate(BlockType.PLANT_PUMPKIN);
      expect(tiles[13][8][8].block).toBe(BlockType.PLANT_PUMPKIN);
    });

    it('should generate Rock', () => {
      runGenerate(BlockType.ROCK_GRANITE);
      expect(tiles[13][8][8].block).toBe(BlockType.ROCK_GRANITE);
    });

    it('should generate Ore', () => {
      runGenerate(BlockType.ORE_GOLD);
      expect(tiles[13][8][8].block).toBe(BlockType.ORE_GOLD);
    });
  });

  describe('populateChunk', () => {
    it('should populate based on biome', () => {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          tiles[5][y][x].block = BlockType.GRASS;
          tiles[3][y][x].biome = 'forest';
        }
      }
      mockNext.mockReturnValue(0.1);

      FloraGenerator.populateChunk(0, 0, tiles, 16, 'seed');

      // Check trunk location. z=2 surface -> tree at z=3.
      // Implemented z+3 = 6.
      expect(tiles[6][0][0].block).not.toBe(BlockType.AIR);
    });

    it('should skip if density check fails', () => {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          tiles[5][y][x].block = BlockType.GRASS;
          tiles[3][y][x].biome = 'forest';
        }
      }
      mockNext.mockReturnValue(0.9);

      FloraGenerator.populateChunk(0, 0, tiles, 16, 'seed');
      expect(tiles[6][0][0].block).toBe(BlockType.AIR);
    });
  });
});
