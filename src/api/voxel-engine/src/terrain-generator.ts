import { Alea, FastNoise } from './utils/math';
import { Tile, BlockType, BiomeType, ZLevel, WorldConfig } from '../../game/src/engine/types';
import { WorldAtlas } from '../../game/src/engine/world';

export class TerrainGenerator {
  private noiseElevation: FastNoise;
  private noiseMoisture: FastNoise;
  private rng: Alea;
  public config: WorldConfig;
  private atlas?: WorldAtlas;

  constructor(config: WorldConfig, atlas?: WorldAtlas) {
    this.config = config;
    this.atlas = atlas;
    this.rng = new Alea(config.seed);
    this.noiseElevation = new FastNoise(config.seed + '_elev');
    this.noiseMoisture = new FastNoise(config.seed + '_moist');
  }

  public generate(chunkX: number, chunkY: number): Tile[][][] {
    const size = this.config.chunkSize;
    const worldOffsetX = chunkX * size;
    const worldOffsetY = chunkY * size;

    // Initialize 7-layer grid
    const tiles: Tile[][][] = Array(7)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => Array(size).fill(null))
      );

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const wx = worldOffsetX + x;
        const wy = worldOffsetY + y;

        // Check Macro Structure
        const structure = this.atlas?.getStructure(wx, wy);

        const nx = wx * this.config.globalScale;
        const ny = wy * this.config.globalScale;

        let elev = this.noiseElevation.fbm(
          nx * this.config.elevationScale,
          ny * this.config.elevationScale,
          Math.floor(this.config.detail),
          this.config.roughness
        );
        let moist = this.noiseMoisture.fbm(nx * this.config.moistureScale, ny * this.config.moistureScale, 2);

        // FLATTEN TERRAIN IF INSIDE STRUCTURE
        // Cities need flat ground roughly at sea level or slightly above
        if (structure) {
          // Flatten to 0.1 (just above sea level 0) with slight jitter
          elev = 0.1;
          // Override moisture to be pleasant?
          moist = 0.5;
        }

        const { biome, surfaceBlock } = this.determineBiome(elev, moist);

        // Z=0 (Surface)
        tiles[3]![y]![x] = this.createTile(wx, wy, 0, surfaceBlock, biome, elev, moist);

        // Z<0 (Underground)
        for (let zIndex = 2; zIndex >= 0; zIndex--) {
          const realZ = (zIndex - 3) as ZLevel;
          const block = realZ === -3 && this.rng.next() > 0.5 ? BlockType.BEDROCK : BlockType.STONE;
          tiles[zIndex]![y]![x] = this.createTile(wx, wy, realZ, block, biome, elev, moist);
        }

        // Z>0 (Sky)
        for (let zIndex = 4; zIndex <= 6; zIndex++) {
          tiles[zIndex]![y]![x] = this.createTile(wx, wy, (zIndex - 3) as ZLevel, BlockType.AIR, biome, elev, moist);
        }
      }
    }

    return tiles;
  }

  public getTileAt(x: number, y: number, z: ZLevel): Tile {
    const nx = x * this.config.globalScale;
    const ny = y * this.config.globalScale;
    let elev = this.noiseElevation.fbm(
      nx * this.config.elevationScale,
      ny * this.config.elevationScale,
      Math.floor(this.config.detail),
      this.config.roughness
    );
    let moist = this.noiseMoisture.fbm(nx * this.config.moistureScale, ny * this.config.moistureScale, 2);

    // Check Macro Structure
    const structure = this.atlas?.getStructure(x, y);
    if (structure) {
      elev = 0.1; // Consistency
      moist = 0.5;
    }

    const { biome, surfaceBlock } = this.determineBiome(elev, moist);

    let block;

    // Determine block based on Z
    if (z === 0) {
      block = surfaceBlock;
    } else if (z < 0) {
      block = z === -3 && this.rng.next() > 0.5 ? BlockType.BEDROCK : BlockType.STONE;
    } else {
      block = BlockType.AIR;
    }

    return this.createTile(x, y, z, block, biome, elev, moist);
  }

  private determineBiome(elev: number, moist: number): { biome: BiomeType; surfaceBlock: BlockType } {
    // Sea Level & Coast
    if (elev < this.config.seaLevel) return { biome: BiomeType.ocean, surfaceBlock: BlockType.WATER };
    if (elev < this.config.seaLevel + 0.05) return { biome: BiomeType.beach, surfaceBlock: BlockType.SAND };

    const adjustedMoist = moist + this.config.temperatureOffset * 0.5;

    // HIGH ELEVATION
    if (elev > 0.8) {
      if (adjustedMoist < -0.3) return { biome: BiomeType.crystal_peaks, surfaceBlock: BlockType.STONE };
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
      if (adjustedMoist < 0.5) return { biome: BiomeType.jungle, surfaceBlock: BlockType.GRASS };
      return { biome: BiomeType.mystic_forest, surfaceBlock: BlockType.GRASS };
    }

    // LOW ELEVATION
    if (adjustedMoist < -0.5) return { biome: BiomeType.lava_wastes, surfaceBlock: BlockType.LAVA };
    if (adjustedMoist < -0.2) return { biome: BiomeType.plains, surfaceBlock: BlockType.GRASS };
    if (adjustedMoist < 0.3) return { biome: BiomeType.forest, surfaceBlock: BlockType.GRASS };
    if (adjustedMoist < 0.6) return { biome: BiomeType.swamp, surfaceBlock: BlockType.DIRT };
    if (adjustedMoist < 0.8) return { biome: BiomeType.fungal_groves, surfaceBlock: BlockType.DIRT };

    return { biome: BiomeType.tundra, surfaceBlock: BlockType.SNOW };
  }

  private createTile(
    x: number,
    y: number,
    z: ZLevel,
    block: BlockType,
    biome: BiomeType,
    elevation: number,
    moisture: number
  ): Tile {
    const isTransparent = (
      [
        BlockType.AIR,
        BlockType.WATER,
        BlockType.DOOR,
        BlockType.GRASS,
        BlockType.DIRT,
        BlockType.SAND,
        BlockType.SNOW,
        BlockType.FLOOR_WOOD,
        BlockType.FLOOR_STONE,
        BlockType.TREE_LEAVES,
        BlockType.CACTUS,
        BlockType.STAIRS_UP,
        BlockType.STAIRS_DOWN,
      ] as BlockType[]
    ).includes(block);

    const isWalkable = (
      [
        BlockType.FLOOR_WOOD,
        BlockType.FLOOR_STONE,
        BlockType.GRASS,
        BlockType.DIRT,
        BlockType.SAND,
        BlockType.SNOW,
        BlockType.DOOR,
        BlockType.STAIRS_UP,
        BlockType.STAIRS_DOWN,
        BlockType.WATER,
      ] as BlockType[]
    ).includes(block);

    return { x, y, z, block, biome, isWalkable, isTransparent, variant: this.rng.next(), elevation, moisture };
  }
}
export function createUnifiedTerrainGenerator(seed: string, params: Partial<WorldConfig> = {}) {
  // Merge defaults with overrides
  const config: WorldConfig = {
    // defaults should be imported from constants but for simplicity/circular avoidance merging here or re-importing
    chunkSize: 16,
    globalScale: 0.02,
    seaLevel: 0.0,
    elevationScale: 0.5,
    roughness: 0.5,
    detail: 4,
    moistureScale: 0.015,
    temperatureOffset: 0.0,
    structureChance: 0.1,
    structureSpacing: 3,
    structureSizeAvg: 10,
    roadDensity: 0.2,
    fogRadius: 15,
    ...params,
    seed,
  };

  const generator = new TerrainGenerator(config);

  return (chunkX: number, chunkY: number, _size?: number) => {
    // If size is provided, it overrides config? Or just assert it matches
    // Currently generator uses config.chunkSize
    return generator.generate(chunkX, chunkY);
  };
}
