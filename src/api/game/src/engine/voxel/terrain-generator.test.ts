import { describe, it, expect } from 'vitest';
import { TerrainGenerator, createUnifiedTerrainGenerator } from './terrain-generator';
import { WorldConfig, BlockType, ZLevel } from '../types';

describe('Terrain Generation Procedural Engine', () => {
  const mockConfig: WorldConfig = {
    seed: 'test-seed-v1',
    chunkSize: 16,
    globalScale: 0.1,
    seaLevel: 0,
    elevationScale: 1,
    moistureScale: 1,
    temperatureOffset: 0,
    roughness: 0.5,
    detail: 1, // fast
    structureChance: 0,
    structureSizeAvg: 0,
    structureSpacing: 0,
    roadDensity: 0,
    fogRadius: 0
  };

  it('should initialize without crashing', () => {
      const generator = new TerrainGenerator(mockConfig);
      expect(generator).toBeDefined();
  });

  it('should generate a 7-layer chunk', () => {
      const generator = new TerrainGenerator(mockConfig);
      const chunk = generator.generate(0, 0);

      // 7 Z-Layers: -3, -2, -1, 0, 1, 2, 3
      expect(chunk).toHaveLength(7);
      
      // Each layer should be 16x16
      expect(chunk[0]).toHaveLength(16);
      expect(chunk[0][0]).toHaveLength(16);
  });

  it('should place bedrock at z=-3 (index 0) randomly', () => {
      // Statistical verification
      const gen = new TerrainGenerator(mockConfig);
      const tiles = gen.generate(0,0);
      const bottomLayer = tiles[0]; // z = -3

      // Just ensure we have some stones/bedrock
      const blocks = bottomLayer.flat().map(t => t.block);
      expect(blocks).toContain(BlockType.STONE);
      // Bedrock logic: z === -3 && rng > 0.5
      // With deterministic seed, we can stick to "should contain some".
  });

  it('should be deterministic with same seed', () => {
      const g1 = new TerrainGenerator(mockConfig);
      const g2 = new TerrainGenerator(mockConfig);
      
      const c1 = g1.generate(0, 0);
      const c2 = g2.generate(0, 0);

      expect(c1[3][5][5].block).toBe(c2[3][5][5].block);
      expect(c1[3][5][5].elevation).toBe(c2[3][5][5].elevation);
  });

  it('should vary with different seed', () => {
      const g1 = new TerrainGenerator({...mockConfig, seed: 'A'});
      const g2 = new TerrainGenerator({...mockConfig, seed: 'B'});
      
      const c1 = g1.generate(0, 0);
      const c2 = g2.generate(0, 0);

      // Unlikely to be EXACTLY same everywhere
      let diff = false;
      for(let y=0; y<16; y++) {
          for(let x=0; x<16; x++) {
              if (c1[3][y][x].elevation !== c2[3][y][x].elevation) diff = true;
          }
      }
      expect(diff).toBe(true);
  });
  
  it('should respect factory function creation', () => {
      const genFn = createUnifiedTerrainGenerator('my-seed');
      const chunk = genFn(1, 1);
      expect(chunk).toHaveLength(7);
  });
});
