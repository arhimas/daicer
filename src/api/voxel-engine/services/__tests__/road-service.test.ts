import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoadService } from '@/api/voxel-engine/services/road-service';
import { BlockType, StructureInfo } from '@daicer/engine/types';

describe('RoadService', () => {
  let service: RoadService;
  let mockStructureService: any;
  let mockConfig: any;
  let tiles: any[][][];

  beforeEach(() => {
    mockStructureService = {
      getRegionStructure: vi.fn(),
    };
    mockConfig = {
      roadDensity: 0.5,
      chunkSize: 32,
    };
    service = new RoadService(mockConfig, mockStructureService);

    // Create 32x32x32 tiles array
    tiles = Array(32)
      .fill(null)
      .map(() =>
        Array(32)
          .fill(null)
          .map(() =>
            Array(32)
              .fill(null)
              .map(() => ({
                block: BlockType.AIR,
                x: 0,
                y: 0,
                z: 0,
                biome: 'plains',
              }))
          )
      );
    // Set ground level
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        tiles[3][y][x].block = BlockType.GRASS;
      }
    }
  });

  it('should connect neighbors with road', () => {
    const source: StructureInfo = {
      type: 'village',
      seed: '123',
      worldX: 10,
      worldY: 10,
      size: 5,
      rotation: 0,
      variant: 0,
    };

    const target: StructureInfo = {
      type: 'town',
      seed: '456',
      worldX: 20,
      worldY: 10, // Horizontal connection
      size: 5,
      rotation: 0,
      variant: 0,
    };

    mockStructureService.getRegionStructure.mockReturnValue(target);

    // Mock RNG to always pass road density check
    // Alea is imported inside the file.
    // We can't easily mock local variable `rng` without hoisting mock of the module.
    // But we can depend on seed. '123_roads'

    // Let's assume roadDensity 1.0 ensures connection
    mockConfig.roadDensity = 1.0;

    service.connectStructureToNeighbors(source, 0, 0, 32, tiles, 0, 0);

    // Check if road was drawn between (12,12) and (22,12) roughly
    // The midpoint should have road
    // x=17, y=12 (approx)
    // center of source (10+2, 10+2) = (12, 12)
    // center of target (20+2, 10+2) = (22, 12)

    // Check tile at 3, 12, 17
    const _roadTile = tiles[3][12][17]; // y=12, x=17
    // Wait, rasterizeRoad uses (tiles, cx, cy, wx, wy, z, type) via TileHelper
    // TileHelper.setBlock(tiles, cx, cy, wx, wy, 0, BlockType.FLOOR_STONE);
    // wx=17, wy=12.
    // tiles[z][y][x] -> tiles[0][12][17] ? No TileHelper usually implies local coords
    // The file uses `tiles[3][ly][lx]` for checking block type.

    // Check if ANY tile became FLOOR_STONE at z=3 (0+3)
    let hasRoad = false;
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        if (tiles[3][y][x].block === BlockType.FLOOR_STONE) {
          hasRoad = true;
        }
      }
    }

    expect(hasRoad).toBe(true);
  });

  it('should build bridge over water', () => {
    const source: StructureInfo = {
      type: 'village',
      title: 'A',
      seed: '123',
      worldX: 10,
      worldY: 10,
      size: 5,
      rotation: 0,
      variant: 0,
    };
    const target = { ...source, worldX: 20, type: 'town' };

    mockStructureService.getRegionStructure.mockReturnValue(target);
    mockConfig.roadDensity = 1.0;

    // Set water at z=3
    for (let x = 10; x < 25; x++) {
      tiles[3][12][x].block = BlockType.WATER;
    }

    service.connectStructureToNeighbors(source, 0, 0, 32, tiles, 0, 0);

    // Should have WOOD floor at z=3
    let hasBridge = false;
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        if (tiles[3][y][x].block === BlockType.FLOOR_WOOD) {
          hasBridge = true;
        }
      }
    }
    expect(hasBridge).toBe(true);
  });
});
