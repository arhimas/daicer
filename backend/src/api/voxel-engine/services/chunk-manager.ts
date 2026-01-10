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

  // This method is added based on the instruction to "Fix tile access in applyVoxelChanges"
  // and the provided code snippet. It assumes VoxelChangeRecord is defined.
  // If this method already exists elsewhere, it should be merged.
  public applyVoxelChanges(chunk: Chunk, changes: VoxelChangeRecord[]): Chunk {
    // Apply changes
    const chunkSize = 16;
    const minZ = -3;
    const maxZ = 3;

    for (const change of changes) {
      const { voxelX, voxelY, voxelZ, newType } = change;
      // Verify bounds
      if (voxelX >= 0 && voxelX < chunkSize && voxelY >= 0 && voxelY < chunkSize && voxelZ >= minZ && voxelZ <= maxZ) {
        const zIndex = voxelZ + 3; // Shift -3..3 to 0..6

        if (chunk.tiles && chunk.tiles[zIndex] && chunk.tiles[zIndex][voxelY] && chunk.tiles[zIndex][voxelY][voxelX]) {
          const tile = chunk.tiles[zIndex][voxelY][voxelX];
          if (tile) {
            tile.block = newType;
          }
        }
      }
    }

    return chunk;
  }

  public async getChunk(x: number, y: number, config: WorldConfig): Promise<Chunk> {
    const key = `${config.seed}_${x}_${y}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    // Fetch changes for this chunk
    // We do this concurrently while waiting for worker, ideally.
    // simpler: fetch changes, then overlay.

    // Actually, getChunk needs to return the chunk.
    // Current implementation:
    // 1. Worker generates chunk
    // 2. We receive chunk
    // 3. We apply changes
    // 4. We cache
    // 5. We return

    // BUT the worker logic in constructor handles caching.
    // If we want to persist edits, we should apply them BEFORE caching in the worker handler?
    // Or we modify the flow.

    // Current worker handler:
    // ... cache.set ... resolve(result)

    // We should intercept the resolve.
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);

      this.pending.set(id, {
        resolve: async (chunk) => {
          // Apply Persistence Here
          try {
            // We need strapi service access. Assuming 'strapi' is global or injected? (It was declare var strapi: any)
            const changes = (await strapi.db.query('api::voxel-change.voxel-change').findMany({
              where: {
                chunkX: chunk.x,
                chunkY: chunk.y,
              },
            })) as unknown as VoxelChangeRecord[];

            if (changes && changes.length > 0) {
              this.applyVoxelChanges(chunk, changes);
            }
          } catch (e) {
            console.error('Failed to apply voxel changes', e);
          }

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
    newType: BlockType,
    reason?: string
  ) {
    // 1. Persist to DB
    await strapi.db.query('api::voxel-change.voxel-change').create({
      data: {
        chunkX,
        chunkY,
        voxelX,
        voxelY,
        voxelZ,
        newType,
        previousType: 'Unknown',
        reason,
        timestamp: Date.now(),
      },
    });

    // 2. Update Cache (scan all caches? no, just matching ones)
    // Since we don't know the seed of every cached chunk easily (keys are string),
    // we can iterate values.
    const chunkSize = 16;
    const minZ = -3;
    const maxZ = 3;

    for (const chunk of this.cache.values()) {
      if (chunk.x === chunkX && chunk.y === chunkY) {
        // Apply update
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
            chunk.tiles[zIndex][voxelY][voxelX].block = newType;
          }
        }
      }
    }
  }
}
