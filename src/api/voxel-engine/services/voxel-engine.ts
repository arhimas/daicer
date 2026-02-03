/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { Chunk, WorldConfig, BlockType } from '@daicer/engine/types';
import { ChunkManager } from '@/api/voxel-engine/services/chunk-manager';

export default () => ({
  /**
   * Retrieves a generated 16x16 Chunk.
   * Delegates to the Singleton ChunkManager.
   */
  async getChunk(x: number, y: number, config: WorldConfig, worldId?: string): Promise<Chunk> {
    return ChunkManager.getInstance().getChunk(x, y, config, worldId);
  },

  async editVoxel(
    chunkX: number,
    chunkY: number,
    voxelX: number,
    voxelY: number,
    voxelZ: number,
    newType: BlockType, // Strapi services types are loose, but we leverage internally
    reason?: string,
    worldId?: string,
    metadata?: Record<string, unknown>
  ) {
    return ChunkManager.getInstance().editVoxel(
      chunkX,
      chunkY,
      voxelX,
      voxelY,
      voxelZ,
      newType,
      worldId,
      reason,
      metadata
    );
  },
});
