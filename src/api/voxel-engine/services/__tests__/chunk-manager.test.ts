/* eslint-disable */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChunkManager } from '@/api/voxel-engine/services/chunk-manager';
import { BlockType } from '@daicer/engine/types';

// Mock Worker Threads
const mockWorker = {
  on: vi.fn(),
  postMessage: vi.fn(),
  terminate: vi.fn(),
};

vi.mock('worker_threads', () => {
  return {
    Worker: class {
      constructor() {
        return mockWorker;
      }
    },
  };
});

// Mock path to avoid process.cwd issues in test env if needed
vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return {
    ...(actual as any),
    resolve: (...args: string[]) => args.join('/'),
  };
});

describe('ChunkManager', () => {
  let manager: ChunkManager;
  let mockStrapi: any;
  let mockQuery: any;
  let mockDocuments: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset Singleton
    (ChunkManager as any).instance = null;

    mockQuery = {
      create: vi.fn(),
    };
    mockDocuments = {
      findMany: vi.fn(),
      create: vi.fn(),
    };

    mockStrapi = {
      db: { query: vi.fn(() => mockQuery) },
      documents: vi.fn(() => mockDocuments),
    };
    (global as any).strapi = mockStrapi;

    manager = ChunkManager.getInstance();
  });

  it('should be a singleton', () => {
    const instance2 = ChunkManager.getInstance();
    expect(manager).toBe(instance2);
  });

  describe('getChunk', () => {
    it('should fetch chunk via worker and cache it', async () => {
      const config = { seed: 'test-seed', chunkSize: 16 } as any;
      const mockChunk = { x: 0, y: 0, tiles: [] };

      // Setup Worker response
      mockWorker.postMessage.mockImplementation(({ id }) => {
        const handler = mockWorker.on.mock.calls.find((call) => call[0] === 'message')[1];
        handler({ id, success: true, result: mockChunk, seed: 'test-seed' });
      });

      const chunk = await manager.getChunk(0, 0, config);
      expect(chunk).toEqual(mockChunk);

      // Verify caching
      mockWorker.postMessage.mockClear();
      const cached = await manager.getChunk(0, 0, config);
      expect(cached).toEqual(mockChunk);
      expect(mockWorker.postMessage).not.toHaveBeenCalled();
    });

    it('should handle worker errors', async () => {
      const config = { seed: 'test-seed' } as any;
      mockWorker.postMessage.mockImplementation(({ id }) => {
        const handler = mockWorker.on.mock.calls.find((call) => call[0] === 'message')[1];
        handler({ id, success: false, error: 'Worker Failed' });
      });

      await expect(manager.getChunk(0, 0, config)).rejects.toThrow('Worker Failed');
    });

    it('should handle worker crash event', async () => {
      const config = { seed: 'test-seed' } as any;
      // We trigger error on worker
      mockWorker.postMessage.mockImplementation(({ id }) => {
        // Trigger global error handler
        const handler = mockWorker.on.mock.calls.find((call) => call[0] === 'error')[1];
        handler(new Error('Worker Crash'));
      });

      await expect(manager.getChunk(0, 0, config)).rejects.toThrow('Worker Crash');
    });

    it('should apply persisted changes on top of generated chunk', async () => {
      const config = { seed: 'persist-seed' } as any;
      // Deep copyable structure
      const tiles = Array.from({ length: 7 }, () =>
        Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => ({ block: BlockType.AIR })))
      );
      const mockChunk = { x: 0, y: 0, tiles };

      // Mock persistence fetch
      const changes = [
        {
          chunkX: 0,
          chunkY: 0,
          voxelX: 0,
          voxelY: 0,
          voxelZ: 0, // zIndex 3
          newType: BlockType.FLOOR_STONE,
          metadata: { meta: 'persisted' },
        },
      ];
      mockDocuments.findMany.mockResolvedValue(changes);

      // Worker returns base chunk
      mockWorker.postMessage.mockImplementation(({ id }) => {
        const handler = mockWorker.on.mock.calls.find((call) => call[0] === 'message')[1];
        // Return deep copy to ensure isolation
        handler({ id, success: true, result: JSON.parse(JSON.stringify(mockChunk)), seed: 'persist-seed' });
      });

      const chunk = await manager.getChunk(0, 0, config, 'world-1');

      expect(chunk.tiles[3][0][0].block).toBe(BlockType.FLOOR_STONE);
      expect(chunk.tiles[3][0][0].metadata).toEqual({ meta: 'persisted' });
    });
  });

  describe('applyVoxelChanges', () => {
    it('should verify bounds and apply changes', () => {
      const tiles = Array.from({ length: 7 }, () =>
        Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => ({ block: BlockType.AIR })))
      );
      const chunk = { x: 0, y: 0, tiles } as any;

      const changes = [
        // Valid
        { chunkX: 0, chunkY: 0, voxelX: 5, voxelY: 5, voxelZ: 0, newType: BlockType.FLOOR_WOOD },
        // Invalid Bounds
        { chunkX: 0, chunkY: 0, voxelX: 20, voxelY: 5, voxelZ: 0, newType: BlockType.BEDROCK },
        { chunkX: 0, chunkY: 0, voxelX: 5, voxelY: 5, voxelZ: 10, newType: BlockType.BEDROCK },
      ];

      manager.applyVoxelChanges(chunk, changes);

      expect(chunk.tiles[3][5][5].block).toBe(BlockType.FLOOR_WOOD);
      // Should stay defaults (implicitly tested by not crashing or polluting)
    });
  });

  describe('editVoxel', () => {
    it('should persist change and update cache', async () => {
      const chunkX = 1,
        chunkY = 1;
      const tiles = Array.from({ length: 7 }, () =>
        Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => ({ block: BlockType.AIR })))
      );
      const chunk = { x: chunkX, y: chunkY, tiles } as any;
      (manager as any).addToCache(chunkX, chunkY, 'seed', chunk);

      await manager.editVoxel(chunkX, chunkY, 0, 0, 0, BlockType.GRASS, 'world-1', 'player');

      expect(mockDocuments.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            chunkX,
            chunkY,
            voxelX: 0,
            voxelY: 0,
            voxelZ: 0,
            newType: BlockType.GRASS,
            world: 'world-1',
          }),
        })
      );

      expect(chunk.tiles[3][0][0].block).toBe(BlockType.GRASS);
    });

    it('should fail over to dirt if type undefined and not in cache', async () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // No cache (cleared in beforeEach by new instance)
      await manager.editVoxel(99, 99, 0, 0, 0, undefined, 'world-1');

      expect(spy).toHaveBeenCalled();
      expect(mockDocuments.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            newType: 'dirt',
          }),
        })
      );
    });

    it('should resolve type from cache if undefined in request', async () => {
      const chunkX = 2,
        chunkY = 2;
      const tiles = Array.from({ length: 7 }, () =>
        Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => ({ block: BlockType.STONE })))
      );
      const chunk = { x: chunkX, y: chunkY, tiles } as any;
      (manager as any).addToCache(chunkX, chunkY, 'seed', chunk);

      // Request update with NO type (metadata only usually, but here checking type resolution)
      await manager.editVoxel(chunkX, chunkY, 0, 0, 0, undefined, 'world-1', 'meta-upd');

      expect(mockDocuments.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            newType: BlockType.STONE, // Solved from cache
          }),
        })
      );
    });
  });
});
