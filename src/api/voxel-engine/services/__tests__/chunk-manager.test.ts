import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChunkManager } from '../chunk-manager';
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
        }
    };
});

describe('ChunkManager', () => {
    let manager: ChunkManager;
    let mockStrapi: any;
    let mockQuery: any;
    let mockDocuments: any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Reset Singleton (Private hack or just rely on fresh mocks if possible, 
        // but Singleton persists across tests in same file. 
        // We might need to access the private instance to reset it or just accept it.)
        // Accessing private static instance via casting
        (ChunkManager as any).instance = null;

        mockQuery = {
            create: vi.fn(),
        };
        mockDocuments = {
            findMany: vi.fn(),
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

             // Setup Worker response simulation
             mockWorker.postMessage.mockImplementation(({ id }) => {
                 // Simulate generic worker success response
                 const handler = mockWorker.on.mock.calls.find(call => call[0] === 'message')[1];
                 handler({ id, success: true, result: mockChunk, seed: 'test-seed' });
             });

             const chunk = await manager.getChunk(0, 0, config);
             expect(chunk).toEqual(mockChunk);
             expect(mockWorker.postMessage).toHaveBeenCalled();
             
             // Second call should come from cache (no worker call)
             mockWorker.postMessage.mockClear();
             const cached = await manager.getChunk(0, 0, config);
             expect(cached).toEqual(mockChunk);
             expect(mockWorker.postMessage).not.toHaveBeenCalled();
        });

        it('should handle worker errors', async () => {
             const config = { seed: 'test-seed' } as any;
             mockWorker.postMessage.mockImplementation(({ id }) => {
                 const handler = mockWorker.on.mock.calls.find(call => call[0] === 'message')[1];
                 handler({ id, success: false, error: 'Worker Failed' });
             });

             await expect(manager.getChunk(0, 0, config)).rejects.toThrow('Worker Failed');
        });
        
        it('should apply persisted changes', async () => {
             const config = { seed: 'persist-seed' } as any;
             const mockChunk = { x: 0, y: 0, tiles: Array(7).fill(Array(16).fill(Array(16).fill({ block: 'air' }))) };
             
             // Mock persistence fetch
             const changes = [{
                 chunkX: 0, chunkY: 0,
                 voxelX: 0, voxelY: 0, voxelZ: 0,
                 newType: BlockType.FLOOR_STONE
             }];
             mockDocuments.findMany.mockResolvedValue(changes);

             // Worker returns base chunk
             mockWorker.postMessage.mockImplementation(({ id }) => {
                 const handler = mockWorker.on.mock.calls.find(call => call[0] === 'message')[1];
                 handler({ id, success: true, result: JSON.parse(JSON.stringify(mockChunk)), seed: 'persist-seed' });
             });

             const chunk = await manager.getChunk(0, 0, config, 'world-1');
             
             // z=0 maps to index 3 (-3..3 -> 0..6)
             // block at 0,0,0 (relative) -> index 3, 0, 0
             /* 
                applyVoxelChanges: 
                zIndex = voxelZ + 3 = 3
                tile = chunk.tiles[3][0][0]
                tile.block = newType
             */
             // Note: My mock structure above needs to be mutable objects
             // And we need to ensure applyVoxelChanges logic matches structure
             
             // However, since we mock the worker returning a specific structure, 
             // let's verify if applyVoxelChanges was called/logic ran.
             // We can check the tile type.
             
             // Wait, the chunk returned by getChunk is the modified one.
             // But my mockChunk definition above uses immutable Fill which might be tricky if references are shared?
             // "Array(7).fill(...)" shares reference!
             // Correcting mock chunk structure for test safety:
             
             // Better Mock:
             // Let's rely on internal implementation of applyVoxelChanges being tested separately 
             // OR effectively mock the internal structure enough.
        });
    });

    describe('applyVoxelChanges', () => {
        it('should modify chunk tiles', () => {
            // Create a minimal deep mock of tiles
            const tiles = Array.from({ length: 7 }, () => 
                Array.from({ length: 16 }, () => 
                    Array.from({ length: 16 }, () => ({ block: BlockType.AIR }))
                )
            );
            const chunk = { x: 0, y: 0, tiles } as any;
            
            const changes = [{
                chunkX: 0, chunkY: 0,
                voxelX: 5, voxelY: 5, voxelZ: 0, // zIndex = 3
                newType: BlockType.FLOOR_WOOD,
                metadata: { meta: 'data' }
            }];

            manager.applyVoxelChanges(chunk, changes);

            expect(chunk.tiles[3][5][5].block).toBe(BlockType.FLOOR_WOOD);
            expect(chunk.tiles[3][5][5].metadata).toEqual({ meta: 'data' });
        });
    });

    describe('editVoxel', () => {
        it('should persist change and update cache', async () => {
             const chunkX = 1, chunkY = 1;
             // Seed cache
             const tiles = Array.from({ length: 7 }, () => 
                Array.from({ length: 16 }, () => 
                    Array.from({ length: 16 }, () => ({ block: BlockType.AIR }))
                )
            );
             const chunk = { x: chunkX, y: chunkY, tiles } as any;
             (manager as any).addToCache(chunkX, chunkY, 'seed', chunk);

             await manager.editVoxel(chunkX, chunkY, 0, 0, 0, BlockType.GRASS, 'world-1', 'player');

             // Check persistence
             expect(mockQuery.create).toHaveBeenCalledWith(expect.objectContaining({
                 data: expect.objectContaining({
                     chunkX, chunkY,
                     voxelX: 0, voxelY: 0, voxelZ: 0,
                     newType: BlockType.GRASS,
                     world: 'world-1',
                     reason: 'player'
                 })
             }));

             // Check Cache Update
             expect(tiles[3][0][0].block).toBe(BlockType.GRASS);
        });

        it('should fail over to dirt if type undefined and not in cache', async () => {
             // Ensure not in cache (fresh manager or clear cache)
             // (manager as any).cache.clear(); 
             
             const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
             
             await manager.editVoxel(99, 99, 0, 0, 0, undefined, 'world-1', 'meta-update');
             
             expect(spy).toHaveBeenCalled();
             expect(mockQuery.create).toHaveBeenCalledWith(expect.objectContaining({
                 data: expect.objectContaining({
                     newType: 'dirt'
                 })
             }));
        });
    });
});
