/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { Chunk, WorldConfig } from '@daicer/engine/types';
import { ChunkManager } from '@/api/voxel-engine/services/chunk-manager';

export class WorldGenerator {
  private config: WorldConfig;

  constructor(config: WorldConfig) {
    this.config = config;
  }

  /**
   * Public interface for generating a single chunk based on world config.
   */
  public async getChunk(chunkX: number, chunkY: number): Promise<Chunk> {
    return ChunkManager.getInstance().getChunk(chunkX, chunkY, this.config);
  }
}
