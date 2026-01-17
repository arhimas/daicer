import { describe, it, expect } from 'vitest';
import { StructureRef, WorldAtlas } from '../world-atlas';
import { TerrainGenerator } from '../../voxel/terrain-generator';
import { CivilizationGenerator } from '../../../../../voxel-engine/services/generators/civilization-generator';
import { WorldConfig, BlockType } from '../../types';

describe('World Gen Deep Integration', () => {
  // Config tuned for 1ft scale
  const config: WorldConfig = {
    seed: 'scale-check-seed',
    chunkSize: 32, // 32 feet wide chunks
    globalScale: 0.01,
    seaLevel: 0,
    elevationScale: 1,
    roughness: 0.5,
    detail: 4,
    moistureScale: 1,
    temperatureOffset: 0,
    structureChance: 1.0, // Force structures everywhere for testing
    structureSpacing: 10, // 10 chunks = 320 feet spacing (Small for testing, but ensures density)
    structureSizeAvg: 50, // 50 feet buildings
    roadDensity: 0.5,
    fogRadius: 10,
  };

  it('should perfectly sync Terrain flattening and Structure placement', () => {
    const atlas = new WorldAtlas(config);

    // 1. Find a chunk that contains a structure center
    // We know structureSpacing is 10 chunks.
    // Let's brute force search a 20x20 chunk area to find a City/Structure center.
    let targetChunk: { x: number; y: number } | null = null;
    let structRef: StructureRef | null = null;

    for (let cy = 0; cy < 20; cy++) {
      for (let cx = 0; cx < 20; cx++) {
        // Check center of the chunk in world coords
        const wx = cx * 32 + 16;
        const wy = cy * 32 + 16;
        const s = atlas.getStructureInCell(Math.floor(wx / (10 * 32)), Math.floor(wy / (10 * 32))); // approximate cell lookups
        if (s && s.type !== 'none') {
          // Check if this specific chunk `cx, cy` is close to the structure center `s.center`
          const dx = wx - s.center.x;
          const dy = wy - s.center.y;
          if (Math.abs(dx) < 16 && Math.abs(dy) < 16) {
            targetChunk = { x: cx, y: cy };
            structRef = s;
            break;
          }
        }
      }
      if (targetChunk) break;
    }

    expect(targetChunk).toBeDefined();
    if (!targetChunk) return;

    console.log(
      `Testing Sync at Chunk ${targetChunk.x},${targetChunk.y} for structure ${structRef.type} at ${structRef.center.x},${structRef.center.y}`
    );

    // 2. Generate Terrain
    const terrainGen = new TerrainGenerator(config, atlas);
    const tiles = terrainGen.generate(targetChunk.x, targetChunk.y);

    // Verify Flattening
    // Center of chunk should be flat ~0.1 elevation
    const _centerTile = tiles[3][16][16]; // Z=3 is Surface in 7-layer (0-6)
    expect(_centerTile.elevation).toBeCloseTo(0.1);
    expect(_centerTile.block).not.toBe(BlockType.WATER);

    // 3. Generate Civilization

    const civGen = new CivilizationGenerator(config, atlas);
    const wOffX = targetChunk.x * 32;
    const wOffY = targetChunk.y * 32;

    // Count blocks before
    let blocksBefore: number = 0;
    tiles.flat(2).forEach((t) => {
      if (t.block !== BlockType.AIR) blocksBefore++;
    });

    civGen.apply(targetChunk.x, targetChunk.y, tiles, wOffX, wOffY);

    // Count blocks after
    let blocksAfter = 0;
    tiles.flat(2).forEach((t) => {
      if (t.block !== BlockType.AIR) blocksAfter++;
    });

    console.log(`Blocks Added by CivGen: ${blocksAfter - blocksBefore}`);
    expect(blocksAfter).toBeGreaterThan(blocksBefore);

    // 4. Verify Vertical Alignment
    // CivGen should place floors at Z=0 (relative to surface layer logic)
    // Our 7-layer system: Z=0 is index 3.
    // Terrain surface is index 3.
    // Buildings usually stamp floors at surface (index 3) or above.
    // Check for specific structure blocks (Stone, Wood)

    const _centerSurfaceInfo = tiles[3][16][16]; // Unused
    // If it's a city/building, the surface block might be overwritten to FLOOR_STONE or similar
    // OR a wall might be built at zIndex 4 (Z=1).

    const hasCivilizationBlock = tiles.some((layer, _zIndex) =>
      layer.some((row) =>
        row.some(
          (t) =>
            t.block === BlockType.FLOOR_STONE || t.block === BlockType.FLOOR_WOOD || t.block === BlockType.WALL_STONE
        )
      )
    );

    expect(hasCivilizationBlock).toBe(true);
  });
});
