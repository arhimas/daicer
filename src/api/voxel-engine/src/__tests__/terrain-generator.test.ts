import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TerrainGenerator } from '@/api/voxel-engine/src/terrain-generator';
import { BiomeType, BlockType } from '@daicer/engine/types';

// Mocks
const mockFbm = vi.fn();
const mockNext = vi.fn();

vi.mock('../utils/math', () => ({
  FastNoise: class {
    constructor(_seed: string) {}
    fbm(...args: any[]) {
      return mockFbm(...args);
    }
  },
  Alea: class {
    constructor(_seed: string) {}
    next() {
      return mockNext();
    }
  },
}));

// Mock WorldAtlas (optional dependency)
vi.mock('@daicer/engine/world', () => ({
  WorldAtlas: class {
    getStructure() {
      return null;
    }
  },
}));

describe('TerrainGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFbm.mockReturnValue(0.5);
    mockNext.mockReturnValue(0.5);
  });

  const baseConfig = {
    chunkSize: 16,
    globalScale: 0.1,
    elevationScale: 1,
    moistureScale: 1,
    detail: 1,
    roughness: 1,
    seaLevel: 0,
    temperatureOffset: 0,
    seed: 'test-seed',
  } as any;

  it('should initialize correctly', () => {
    const gen = new TerrainGenerator(baseConfig);
    expect(gen).toBeDefined();
  });

  describe('Biome Determination (via getTileAt)', () => {
    it('should generate Ocean when elevation < seaLevel', () => {
      const gen = new TerrainGenerator({ ...baseConfig, seaLevel: 0.5 });
      // Elev: 0.2, Moist: 0.5
      mockFbm.mockReturnValueOnce(0.2).mockReturnValueOnce(0.5);

      const tile = gen.getTileAt(0, 0, 0);
      expect(tile.biome).toBe(BiomeType.ocean);
      expect(tile.block).toBe(BlockType.WATER);
    });

    it('should generate Beach when slightly above sea level', () => {
      const gen = new TerrainGenerator({ ...baseConfig, seaLevel: 0.2 });
      // Elev: 0.22 (Sea 0.2 + 0.05 window), Moist: 0.5
      mockFbm.mockReturnValueOnce(0.22).mockReturnValueOnce(0.5);

      const tile = gen.getTileAt(0, 0, 0);
      expect(tile.biome).toBe(BiomeType.beach);
      expect(tile.block).toBe(BlockType.SAND);
    });

    it('should generate Snowden/Mountain at high elevation', () => {
      const gen = new TerrainGenerator(baseConfig);
      // Elev: 0.9 (> 0.8), Moist: 0.5
      mockFbm.mockReturnValueOnce(0.9).mockReturnValueOnce(0.5);

      const tile = gen.getTileAt(0, 0, 0);
      expect(tile.biome).toBe(BiomeType.snowy_peaks);
      expect(tile.block).toBe(BlockType.SNOW);
    });

    it('should generate Desert at mid-elevation and low moisture', () => {
      const gen = new TerrainGenerator(baseConfig);
      // Elev: 0.4 (> 0.3), Moist: -0.8 (<-0.3)
      mockFbm.mockReturnValueOnce(0.4).mockReturnValueOnce(-0.8);

      const tile = gen.getTileAt(0, 0, 0);
      expect(tile.biome).toBe(BiomeType.desert);
      expect(tile.block).toBe(BlockType.SAND);
    });

    it('should generate Plains at low elevation and moderate moisture', () => {
      const gen = new TerrainGenerator(baseConfig);
      // Elev: 0.1 (< 0.3), Moist: 0.0 (between -0.2 and 0.3 is forest? check code)
      // Code: adjustedMoist < -0.2 -> plains.
      // Let's try moist -0.4.
      mockFbm.mockReturnValueOnce(0.1).mockReturnValueOnce(-0.4);

      const tile = gen.getTileAt(0, 0, 0);
      expect(tile.biome).toBe(BiomeType.plains);
      expect(tile.block).toBe(BlockType.GRASS);
    });
  });

  describe('generate (Chunk)', () => {
    it('should return a 7-layer 16x16 grid', () => {
      const gen = new TerrainGenerator(baseConfig);
      const tiles = gen.generate(0, 0);

      expect(tiles.length).toBe(7);
      expect(tiles[0].length).toBe(16);
      expect(tiles[0][0].length).toBe(16);
    });

    it('should generate Bedrock at Z=-3 (randomly)', () => {
      const gen = new TerrainGenerator(baseConfig);
      mockNext.mockReturnValue(0.9); // > 0.5 -> Bedrock

      const tiles = gen.generate(0, 0);
      // Z=-3 is index 0.
      expect(tiles[0][0][0].block).toBe(BlockType.BEDROCK);
    });

    it('should generate Stone at Z=-3 (randomly)', () => {
      const gen = new TerrainGenerator(baseConfig);
      mockNext.mockReturnValue(0.1); // < 0.5 -> Stone

      const tiles = gen.generate(0, 0);
      // Z=-3 is index 0.
      expect(tiles[0][0][0].block).toBe(BlockType.STONE);
    });
  });
});
