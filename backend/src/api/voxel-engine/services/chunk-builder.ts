import { Chunk, WorldConfig } from '../../../engine';
import { TerrainGenerator } from '../../../engine';
import { WorldAtlas } from '../../../engine/world';
import { CivilizationGenerator } from './generators/civilization-generator';

export class ChunkBuilder {
  private terrainGen: TerrainGenerator;
  private civGen: CivilizationGenerator;
  private atlas: WorldAtlas;

  constructor(private config: WorldConfig) {
    this.atlas = new WorldAtlas(config);
    this.terrainGen = new TerrainGenerator(config, this.atlas);
    this.civGen = new CivilizationGenerator(config, this.atlas);
  }

  public generateChunk(chunkX: number, chunkY: number): Chunk {
    const size = this.config.chunkSize;
    const worldOffsetX = chunkX * size;
    const worldOffsetY = chunkY * size;

    // 1. Terrain (+ Macro overrides from Atlas)
    const tiles = this.terrainGen.generate(chunkX, chunkY);

    // 2. Civilization (Roads & Structures)
    this.civGen.apply(chunkX, chunkY, tiles, worldOffsetX, worldOffsetY);

    return { x: chunkX, y: chunkY, tiles };
  }
}
