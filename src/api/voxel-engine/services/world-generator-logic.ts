import { Chunk, WorldConfig } from '../../game/src/engine/types';
import { ChunkManager } from './chunk-manager';

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
