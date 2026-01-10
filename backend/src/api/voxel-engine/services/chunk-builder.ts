import { Chunk, WorldConfig } from '../../game/src/engine/types';
import { TerrainGenerator } from '../src/terrain-generator';
import { WorldAtlas } from '../../game/src/engine/world/world-atlas';
import { CivilizationGenerator } from './generators/civilization-generator';
import { FloraGenerator } from './generators/flora-generator';

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

    // 2. Flora (Trees, Plants, Rocks)
    FloraGenerator.populateChunk(chunkX, chunkY, tiles, size, this.config.seed);

    // 3. Civilization (Roads & Structures)
    // Civilization generator clears vegetation for roads/buildings
    this.civGen.apply(chunkX, chunkY, tiles, worldOffsetX, worldOffsetY);

    return {
      x: chunkX,
      y: chunkY,
      tiles,
      size: size,
      minZ: -3,
      maxZ: 3,
      seed: this.config.seed,
    };
  }
}
