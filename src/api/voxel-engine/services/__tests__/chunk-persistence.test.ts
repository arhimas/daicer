/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChunkManager } from '@/api/voxel-engine/services/chunk-manager';
import { WorldConfig } from '@/game/src/engine/types';

// Mock Worker to avoid actual threading in unit tests
let workerCallback: (msg: any) => void;
const mockPostMessage = vi.fn(({ id, chunkX, chunkY }) => {
  if (workerCallback) {
    workerCallback({
      id,
      success: true,
      result: {
        x: chunkX,
        y: chunkY,
        size: 16,
        minZ: -3,
        maxZ: 3,
        tiles: [],
      },
      seed: 'test-seed',
    });
  }
});

vi.mock('worker_threads', () => {
  return {
    Worker: class {
      constructor() {
        // Return the mock interface
      }
      on(event: string, callback: any) {
        if (event === 'message') workerCallback = callback;
      }
      postMessage(data: any) {
        mockPostMessage(data);
      }
    },
  };
});

describe('ChunkManager Persistence', () => {
  let chunkManager: ChunkManager;

  const mockDbCreate = vi.fn();
  const mockDbFindMany = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton if possible, or just ignore since we mock internals
    // ChunkManager is a singleton, so we need to be careful.
    // Ideally we could reset the instance, but it's private.
    // For now, we rely on the fact we mock Strapi globally for each test run.

    // Mock Strapi Global
    (global as any).strapi = {
      db: {
        query: () => ({
          create: mockDbCreate,
          findMany: mockDbFindMany,
        }),
      },
    };
    // Mock Strapi Documents API
    (global as any).strapi.documents = vi.fn().mockImplementation(() => ({
      findMany: mockDbFindMany, // Re-use the db mock for documents API too
    }));

    chunkManager = ChunkManager.getInstance();
  });

  it('should persist metadata when editing a voxel', async () => {
    const chunkX = 0;
    const chunkY = 0;
    const voxelX = 5;
    const voxelY = 5;
    const voxelZ = 0;
    const newType = 'stone'; // Using string matching BlockType
    const metadata = { poi: 'Test POI', type: 'death_marker' };

    // We need to manually populate the cache first or the edit might fail to find the tile?
    // In editVoxel logic:
    // 1. Persist to DB (always happens)
    // 2. Update Cache (only if cached)
    // We strictly want to test Persistence (Step 1).

    await chunkManager.editVoxel(
      chunkX,
      chunkY,
      voxelX,
      voxelY,
      voxelZ,
      newType as any,
      'testing',
      undefined,
      metadata
    );

    expect(mockDbCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        chunkX,
        chunkY,
        voxelX,
        voxelY,
        voxelZ,
        newType,
        metadata,
      }),
    });
  });

  it('should apply persisted metadata when loading a chunk', async () => {
    const chunkX = 1;
    const chunkY = 1;
    const config = { seed: 'test' } as WorldConfig;

    // Mock DB returning a change with metadata
    mockDbFindMany.mockResolvedValue([
      {
        chunkX,
        chunkY,
        voxelX: 0,
        voxelY: 0,
        voxelZ: 0,
        newType: 'water',
        metadata: { event: 'flood' },
      },
    ]);

    // We need to override the default mock behavior to return actual tiles
    mockPostMessage.mockImplementationOnce(({ id, chunkX: cx, chunkY: cy }) => {
      // Construct a dummy 3D array for tiles
      // z: 0 (index 3), y: 0, x: 0
      const tiles = [];
      for (let z = 0; z < 7; z++) {
        const layer = [];
        for (let y = 0; y < 16; y++) {
          const row = [];
          for (let x = 0; x < 16; x++) {
            row.push({ x, y, z: z - 3, block: 'air' });
          }
          layer.push(row);
        }
        tiles.push(layer);
      }

      if (workerCallback) {
        workerCallback({
          id,
          success: true,
          result: {
            x: cx,
            y: cy,
            size: 16,
            minZ: -3,
            maxZ: 3,
            tiles,
          },
          seed: 'test',
        });
      }
    });

    const chunk = await chunkManager.getChunk(chunkX, chunkY, config);

    expect(chunk).toBeDefined();
    // Check if tile at 0,0,0 (index 3, 0, 0) has the metadata
    const tile = chunk.tiles[3][0][0];
    expect(tile.block).toBe('water');
    expect(tile.metadata).toEqual({ event: 'flood' });
  });
});
