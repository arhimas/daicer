import { BiomeType, BlockType, Tile, WorldConfig, ZLevel } from '../../game/src/engine/types';
import { Alea, FastNoise } from '../src/utils/math';
import { TileHelper } from './utils/tile-helper';

export class BiomeService {
  private noiseElevation: FastNoise;
  private noiseMoisture: FastNoise;
  private rng: Alea;
  private config: WorldConfig;

  constructor(config: WorldConfig) {
    this.config = config;
    this.rng = new Alea(config.seed);
    this.noiseElevation = new FastNoise(config.seed + '_elev');
    this.noiseMoisture = new FastNoise(config.seed + '_moist');
  }

  public generateBaseTerrain(chunkX: number, chunkY: number, tiles: Tile[][][]): void {
    const size = this.config.chunkSize;
    const worldOffsetX = chunkX * size;
    const worldOffsetY = chunkY * size;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const wx = worldOffsetX + x;
        const wy = worldOffsetY + y;

        // Noise Calculations
        const nx = wx * this.config.globalScale;
        const ny = wy * this.config.globalScale;
        const elev = this.noiseElevation.fbm(
          nx * this.config.elevationScale,
          ny * this.config.elevationScale,
          Math.floor(this.config.detail),
          this.config.roughness
        );
        const moist = this.noiseMoisture.fbm(nx * this.config.moistureScale, ny * this.config.moistureScale, 2);

        const { biome, surfaceBlock } = this.determineBiome(elev, moist);

        // Z=0 (Surface)
        tiles[3][y][x] = TileHelper.createTile(wx, wy, 0, surfaceBlock, biome, this.rng);

        // Z<0 (Underground)
        for (let zIndex = 2; zIndex >= 0; zIndex--) {
          const realZ = (zIndex - 3) as ZLevel;
          const block = realZ === -3 && this.rng.next() > 0.5 ? BlockType.BEDROCK : BlockType.STONE;
          tiles[zIndex][y][x] = TileHelper.createTile(wx, wy, realZ, block, biome, this.rng);
        }

        // Z>0 (Sky)
        for (let zIndex = 4; zIndex <= 6; zIndex++) {
          tiles[zIndex][y][x] = TileHelper.createTile(wx, wy, (zIndex - 3) as ZLevel, BlockType.AIR, biome, this.rng);
        }
      }
    }
  }

  private determineBiome(elev: number, moist: number): { biome: BiomeType; surfaceBlock: BlockType } {
    // Sea Level & Coast
    if (elev < this.config.seaLevel) return { biome: BiomeType.ocean, surfaceBlock: BlockType.WATER };
    if (elev < this.config.seaLevel + 0.05) return { biome: BiomeType.beach, surfaceBlock: BlockType.SAND };

    const adjustedMoist = moist + this.config.temperatureOffset * 0.5;

    // HIGH ELEVATION (Mountains & Peaks)
    if (elev > 0.8) {
      if (adjustedMoist < -0.3) return { biome: BiomeType.crystal_peaks, surfaceBlock: BlockType.STONE }; // Special dry peaks
      return { biome: BiomeType.snowy_peaks, surfaceBlock: BlockType.SNOW };
    }
    if (elev > 0.6) {
      if (adjustedMoist < -0.3) return { biome: BiomeType.badlands, surfaceBlock: BlockType.SAND };
      return { biome: BiomeType.mountain, surfaceBlock: BlockType.STONE };
    }

    // MID ELEVATION
    if (elev > 0.3) {
      if (adjustedMoist < -0.3) return { biome: BiomeType.desert, surfaceBlock: BlockType.SAND };
      if (adjustedMoist < -0.1) return { biome: BiomeType.savanna, surfaceBlock: BlockType.GRASS };
      if (adjustedMoist < 0.2) return { biome: BiomeType.forest, surfaceBlock: BlockType.GRASS };
      if (adjustedMoist < 0.5) return { biome: BiomeType.jungle, surfaceBlock: BlockType.GRASS }; // Dense
      return { biome: BiomeType.mystic_forest, surfaceBlock: BlockType.GRASS }; // Very wet magical
    }

    // LOW ELEVATION (Plains, Swamps, Wastes)
    // Low elevation extreme dryness -> Lava Wastes / Badlands
    if (adjustedMoist < -0.5) return { biome: BiomeType.lava_wastes, surfaceBlock: BlockType.LAVA }; // Dangerous!
    if (adjustedMoist < -0.2) return { biome: BiomeType.plains, surfaceBlock: BlockType.GRASS };
    if (adjustedMoist < 0.3) return { biome: BiomeType.forest, surfaceBlock: BlockType.GRASS };
    if (adjustedMoist < 0.6) return { biome: BiomeType.swamp, surfaceBlock: BlockType.DIRT };
    if (adjustedMoist < 0.8) return { biome: BiomeType.fungal_groves, surfaceBlock: BlockType.DIRT }; // Alien

    return { biome: BiomeType.tundra, surfaceBlock: BlockType.SNOW }; // Extreme wet/cold fallback or just default
  }
}
