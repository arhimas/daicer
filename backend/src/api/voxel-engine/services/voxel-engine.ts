import { Chunk, WorldConfig } from '../../game/src/engine/types';
import { ChunkManager } from './chunk-manager';

export default () => ({
  async getChunk(x: number, y: number, config: WorldConfig): Promise<Chunk> {
    return ChunkManager.getInstance().getChunk(x, y, config);
  },
});
