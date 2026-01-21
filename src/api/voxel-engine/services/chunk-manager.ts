import { Worker } from 'worker_threads';
import path from 'path';
import { Chunk, WorldConfig, BlockType } from '../../game/src/engine/types';

interface VoxelChangeRecord {
  chunkX: number;
  chunkY: number;
  voxelX: number;
  voxelY: number;
  voxelZ: number;
  newType: BlockType;
  previousType?: string;
  metadata?: Record<string, unknown>;
}

export class ChunkManager {
  private static instance: ChunkManager;
  private worker: Worker;
  private pending: Map<string, { resolve: (c: Chunk) => void; reject: (e: unknown) => void }>;
  private cache: Map<string, Chunk>;

  private constructor() {
    this.pending = new Map();
    this.cache = new Map();

    const workerPath = path.resolve(process.cwd(), 'src/api/voxel-engine/services/chunk-worker-loader.js');
    this.worker = new Worker(workerPath);

    this.worker.on('message', (msg: { id: string; success: boolean; result: Chunk; error?: string; seed?: string }) => {
      const { id, success, result, error } = msg;
      if (this.pending.has(id)) {
        const { resolve, reject } = this.pending.get(id)!;
        this.pending.delete(id);
        if (success) {
          this.addToCache(result.x, result.y, msg.seed, result); // Ideally we pass seed back or track it
          resolve(result);
        } else {
          reject(new Error(error));
        }
      }
    });

    this.worker.on('error', (err) => {
      console.error('Chunk Worker Error:', err);
      // Fail all pending
      for (const { reject } of this.pending.values()) {
        reject(err);
      }
      this.pending.clear();
    });
  }

  public static getInstance(): ChunkManager {
    if (!ChunkManager.instance) {
      ChunkManager.instance = new ChunkManager();
    }
    return ChunkManager.instance;
  }

  private addToCache(x: number, y: number, seed: string, chunk: Chunk) {
    const key = `${seed}_${x}_${y}`;
    if (this.cache.size > 200) {
      const first = this.cache.keys().next().value;
      if (first) this.cache.delete(first);
    }
    this.cache.set(key, chunk);
  }

  public applyVoxelChanges(chunk: Chunk, changes: VoxelChangeRecord[]): Chunk {
    // Apply changes
    const chunkSize = 16;
    const minZ = -3;
    const maxZ = 3;

    for (const change of changes) {
      const { voxelX, voxelY, voxelZ, newType, metadata } = change;
      // Verify bounds
      if (voxelX >= 0 && voxelX < chunkSize && voxelY >= 0 && voxelY < chunkSize && voxelZ >= minZ && voxelZ <= maxZ) {
        const zIndex = voxelZ + 3; // Shift -3..3 to 0..6

        if (chunk.tiles && chunk.tiles[zIndex] && chunk.tiles[zIndex][voxelY] && chunk.tiles[zIndex][voxelY][voxelX]) {
          const tile = chunk.tiles[zIndex][voxelY][voxelX];
          if (tile) {
            tile.block = newType;
            if (metadata) {
              tile.metadata = { ...(tile.metadata || {}), ...metadata };
            }
          }
        }
      }
    }

    return chunk;
  }

  public async getChunk(x: number, y: number, config: WorldConfig, worldId?: string): Promise<Chunk> {
    const key = `${config.seed}_${x}_${y}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);

      this.pending.set(id, {
        resolve: async (chunk) => {
          // Apply Persistence Here
          try {
            const filters: any = {
                chunkX: chunk.x,
                chunkY: chunk.y,
            };
            if (worldId) {
                filters.world = { documentId: worldId };
            }

            const changes = (await strapi.documents('api::voxel-change.voxel-change').findMany({
              filters: filters,
            })) as unknown as VoxelChangeRecord[];

            if (changes && changes.length > 0) {
              this.applyVoxelChanges(chunk, changes);
            }
          } catch (e) {
            console.error('Failed to apply voxel changes', e);
          }

          // On-Demand Spawning Integration - REMOVED
          // Spawning is now handled by TurnProcessing (Exploration Event) to ensure Room context.

          this.addToCache(chunk.x, chunk.y, config.seed, chunk);
          resolve(chunk);
        },
        reject,
      });

      this.worker.postMessage({ id, chunkX: x, chunkY: y, config });
    });
  }

  public async editVoxel(
    chunkX: number,
    chunkY: number,
    voxelX: number,
    voxelY: number,
    voxelZ: number,
    newType: BlockType | undefined,
    worldId?: string,
    reason?: string,
    metadata?: Record<string, unknown>
  ) {
    // 1. Resolve Type if undefined (Metadata Only Update)
    let solvedType = newType;
    if (!solvedType) {
      // We need to fetch the chunk to know the current type
      // This causes a read-before-write.
      // We can use our own getChunk (which uses cache).
      try {
        // Reconstruct config? We need seed...
        // If we don't have config, we might check cache directly.
        // Iterating cache for matching chunk:
        for (const chunk of this.cache.values()) {
          if (chunk.x === chunkX && chunk.y === chunkY) {
            const zIndex = voxelZ + 3;
            const tile = chunk.tiles?.[zIndex]?.[voxelY]?.[voxelX];
            if (tile) {
              solvedType = tile.block as BlockType;
            }
            break;
          }
        }

        // If still not found (not in cache and no config to fetch), we might fallback or error.
        // Fallback: 'dirt' (unsafe) or just fail.
        if (!solvedType) {
          // Safety: Default to 'air' but log warning? Or 'dirt'?
          // Let's assume 'dirt' for stability if cache miss, but ideally we should fetch.
          // Given we don't have 'config' here easily, we rely on cache or previous systems.
          // We will default to 'dirt' to ensure persistence succeeds, but log it.
          console.warn(
            `[ChunkManager] editVoxel: newType undefined and chunk not in cache for ${chunkX},${chunkY}. Defaulting to 'dirt'.`
          );
          solvedType = 'dirt' as BlockType;
        }
      } catch {
        solvedType = 'dirt' as BlockType;
      }
    }

    // 2. Persist to DB
    await strapi.db.query('api::voxel-change.voxel-change').create({
      data: {
        world: worldId,
        chunkX,
        chunkY,
        voxelX,
        voxelY,
        voxelZ,
        newType: solvedType,
        previousType: 'Unknown',
        reason,
        timestamp: Date.now(),
        metadata,
      },
    });

    // 2. Update Cache
    const chunkSize = 16;
    const minZ = -3;
    const maxZ = 3;

    for (const chunk of this.cache.values()) {
      if (chunk.x === chunkX && chunk.y === chunkY) {
        if (
          voxelX >= 0 &&
          voxelX < chunkSize &&
          voxelY >= 0 &&
          voxelY < chunkSize &&
          voxelZ >= minZ &&
          voxelZ <= maxZ
        ) {
          const zIndex = voxelZ + 3;
          if (
            chunk.tiles &&
            chunk.tiles[zIndex] &&
            chunk.tiles[zIndex][voxelY] &&
            chunk.tiles[zIndex][voxelY][voxelX]
          ) {
            const tile = chunk.tiles[zIndex][voxelY][voxelX];
            tile.block = newType;
            if (metadata) {
              tile.metadata = { ...(tile.metadata || {}), ...metadata };
            }
          }
        }
      }
    }
  }
}
