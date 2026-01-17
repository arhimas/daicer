import { Chunk, WorldConfig } from '../../game/src/engine/types';
import { ChunkManager } from './chunk-manager';

export default () => ({
  async getChunk(x: number, y: number, config: WorldConfig): Promise<Chunk> {
    return ChunkManager.getInstance().getChunk(x, y, config);
  },

  async editVoxel(
    chunkX: number,
    chunkY: number,
    voxelX: number,
    voxelY: number,
    voxelZ: number,
    newType: any, // Strapi services types are loose, but we leverage internally
    reason?: string,
    metadata?: Record<string, unknown>
  ) {
    return ChunkManager.getInstance().editVoxel(chunkX, chunkY, voxelX, voxelY, voxelZ, newType, reason, metadata);
  },
});

