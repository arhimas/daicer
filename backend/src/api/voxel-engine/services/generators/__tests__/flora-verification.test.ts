import { describe, it, expect } from 'vitest';
import { FloraGenerator } from '../flora-generator';
import { BlockType, Tile } from '../../../../game/src/engine/types';
import { Alea } from '../../../src/utils/math';

describe('FloraGenerator', () => {
  // Helper to create a basic chunk
  const createChunk = (biome: string) => {
    const size = 16;
    return Array(7)
      .fill(null)
      .map((_, z) =>
        Array(size)
          .fill(null)
          .map((_, y) =>
            Array(size)
              .fill(null)
              .map(
                (_, x) =>
                  ({
                    x,
                    y,
                    z: z - 3,
                    block:
                      z - 3 === 0
                        ? biome === 'desert' || biome === 'beach'
                          ? BlockType.SAND
                          : BlockType.GRASS
                        : z - 3 < 0
                          ? BlockType.STONE
                          : BlockType.AIR,
                    biome: biome as any,
                    isWalkable: true,
                    isTransparent: true,
                  }) as Tile
              )
          )
      );
  };

  it('should generate a specific tree type correctly', () => {
    const tiles = createChunk('plains');
    const rng = new Alea('test_tree');
    // Force generate a Palm Tree at 8,8
    FloraGenerator['generateTree'](tiles, 0, 0, 8, 8, 1, BlockType.TREE_PALM, rng);

    // Palm tree structure: Trunk (TREE_PALM) + Leaves (TREE_LEAVES)
    const trunkBlock = tiles[3 + 1][8][8].block; // Z=1
    expect(trunkBlock).toBe(BlockType.TREE_PALM);

    // Check for leaves higher up
    let hasLeaves = false;
    for (let z = 4; z < 7; z++) {
      // Check higher Z
      const block = tiles[z][8][8].block;
      if (block === BlockType.TREE_LEAVES) hasLeaves = true;
    }
    expect(hasLeaves).toBe(true);
  });

  it('should populate forest chunk with vegetation', () => {
    const size = 16;
    const tiles = createChunk('forest');
    FloraGenerator.populateChunk(0, 0, tiles, size, 'seed_forest_dense');

    // Check for trees (Wood or Leaves) or plants
    let vegetationCount = 0;
    for (let z = 0; z < 7; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const block = tiles[z][y][x].block as BlockType;
          if (
            [BlockType.TREE_OAK, BlockType.TREE_BIRCH, BlockType.TREE_LEAVES, BlockType.PLANT_GRASS].includes(block)
          ) {
            vegetationCount++;
          }
        }
      }
    }
    expect(vegetationCount).toBeGreaterThan(0);
  });

  it('should populate desert with cactus', () => {
    const size = 16;
    const tiles = createChunk('desert');
    FloraGenerator.populateChunk(0, 0, tiles, size, 'seed_desert_v1');

    let cactusCount = 0;
    for (let z = 0; z < 7; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const block = tiles[z][y][x].block as BlockType;
          if ([BlockType.CACTUS, BlockType.PLANT_CACTUS].includes(block)) {
            cactusCount++;
          }
        }
      }
    }
    expect(cactusCount).toBeGreaterThan(0);
  });

  it('should place rocks in lava wastes (high density check)', () => {
    const size = 16;
    const tiles = createChunk('lava_wastes');
    FloraGenerator.populateChunk(0, 0, tiles, size, 'seed_lava');

    let rockCount = 0;
    for (let z = 0; z < 7; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const block = tiles[z][y][x].block as BlockType;
          if ([BlockType.ROCK_MAGMA, BlockType.ROCK_OBSIDIAN].includes(block)) {
            rockCount++;
          }
        }
      }
    }
    // Lava wastes has density 0.05, rock magma 0.5. Should definitely spawn something in 256 tiles.
    expect(rockCount).toBeGreaterThan(0);
  });
});
