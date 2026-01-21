/**
 * Default configuration parameters for world generation.
 * These values serve as the baseline for procedural terrain generation,
 * defining chunk sizes, noise scaling, and structure density.
 *
 * @see {@link WorldConfig} for type definition.
 */
export const DEFAULT_GENERATION_PARAMS = {
  /** Size of a single map chunk in voexls (WxH). */
  chunkSize: 16,
  /** Multiplier for coordinate scaling input to noise functions. */
  globalScale: 0.02,
  /** Height threshold for water level (0-1). */
  seaLevel: 0.0,
  /** Vertical scaling factor for terrain height noise. */
  elevationScale: 0.5,
  /** Persistence factor for fractal brownian motion (jaggedness). */
  roughness: 0.5,
  /** Number of noise octaves for terrain detail. */
  detail: 4,
  /** Scaling factor for moisture noise map. */
  moistureScale: 0.015,
  /** Global temperature offset applied to biome calculations. */
  temperatureOffset: 0.0,
  /** Probability (0-1) of a structure appearing in a chunk interaction check. */
  structureChance: 0.1,
  /** Minimum chunk distance between structures. */
  structureSpacing: 3,
  /** Average size of generated structures in tiles. */
  structureSizeAvg: 10,
  /** Density of road generation (0-1). */
  roadDensity: 0.2,
  /** Radius for fog of war or visibility calculations. */
  fogRadius: 15,
};
