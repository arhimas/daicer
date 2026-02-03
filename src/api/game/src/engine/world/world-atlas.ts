import { Alea, FastNoise } from '@daicer/engine/voxel/utils/math';
import { WorldConfig } from '@daicer/engine/types';

/**
 * Represents metadata about a generated world region (Voronoi cell).
 */
export interface RegionInfo {
  /** Unique ID of the region (e.g. "12,45" based on grid index). */
  id: string; // "12,45"
  /** World coordinates of the region center. */
  center: { x: number; y: number };
  /** Dominant biome of the region. */
  biome: string; // "Forest"
  /** Procedurally generated name of the region. */
  name: string; // "Eldoria"
  /** Economic wealth factor (0-1). */
  wealth: number; // 0-1
  /** Danger/Hostility factor (0-1). */
  danger: number; // 0-1
}

/**
 * Represents a macro-structure (City, Village, Ruin) located in a region.
 */
export interface StructureRef {
  /** Type of structure. */
  type: 'city' | 'village' | 'ruin' | 'none';
  /** Name of the structure (usually matches region name). */
  name: string;
  /** Radius of influence in world units. */
  radius: number;
  /** Exact center coordinates. */
  center: { x: number; y: number };
  /** Deterministic seed for internal structure generation. */
  seed: string;
}

/**
 * Manages macro-scale world features using an infinite Voronoi grid.
 * Determines where regions, cities, and major landmarks are located
 * before the voxel engine generates the terrain details.
 */
export class WorldAtlas {
  private noiseRegions: FastNoise;
  private rng: Alea;
  private config: WorldConfig;
  private regionCache: Map<string, RegionInfo> = new Map();

  constructor(config: WorldConfig) {
    this.config = config;
    this.rng = new Alea(config.seed);
    this.noiseRegions = new FastNoise(config.seed + '_regions');
    // Configure for Cellular (Voronoi) noise
    // Note: FastNoiseJS might default to Simplex if not configured,
    // but we can use cell functionality if available or simulate it.
    // If standard FastNoise doesn't expose GetCellular, we simulate "Regions" via low-frequency noise
    // or we implement a simple grid-based Voronoi (jittered grid) manually here.
  }

  /**
   * Get the region info for a world position.
   * Uses Jittered Grid (Infinite Voronoi) approach to find the closest region center.
   *
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @returns The RegionInfo for the enclosing Voronoi cell.
   */
  public getRegion(x: number, y: number): RegionInfo {
    const cellSize = Math.max(1, Math.floor(this.config.structureSpacing)) * this.config.chunkSize;
    // same logic

    const cellOp = (cx: number, cy: number) => {
      const regionSeed = `${this.config.seed}_${cx}_${cy}`;
      const rng = new Alea(regionSeed);
      const jitterX = (rng.next() - 0.5) * cellSize * 0.8;
      const jitterY = (rng.next() - 0.5) * cellSize * 0.8;
      return {
        x: cx * cellSize + cellSize / 2 + jitterX,
        y: cy * cellSize + cellSize / 2 + jitterY,
        seed: regionSeed,
      };
    };

    const cx = Math.floor(x / cellSize);
    const cy = Math.floor(y / cellSize);

    // Check 3x3 neighbors to find closest center (Voronoi)
    let closestDist = Infinity;
    let closestCenter = { x: 0, y: 0, seed: '' };
    let closestId = '';

    for (let ny = cy - 1; ny <= cy + 1; ny++) {
      for (let nx = cx - 1; nx <= cx + 1; nx++) {
        const center = cellOp(nx, ny);
        const dx = x - center.x;
        const dy = y - center.y;
        const dist = dx * dx + dy * dy;
        if (dist < closestDist) {
          closestDist = dist;
          closestCenter = center;
          closestId = `${nx},${ny}`;
        }
      }
    }

    return this.generateRegionData(closestId, closestCenter);
  }

  // Generate deterministic data for the region
  private generateRegionData(id: string, center: { x: number; y: number; seed: string }): RegionInfo {
    if (this.regionCache.has(id)) return this.regionCache.get(id)!;

    // Deterministic RNG for this region
    const rng = new Alea(center.seed + '_meta');

    // Generate Name (Simple Markov or List)
    const syllables = ['dor', 'gan', 'el', 'mor', 'thul', 'ia', 'wen', 'bar', 'heim', 'gard'];
    const nameLen = 2 + Math.floor(rng.next() * 2);
    let name = '';
    for (let i = 0; i < nameLen; i++) name += syllables[Math.floor(rng.next() * syllables.length)];
    name = name.charAt(0).toUpperCase() + name.slice(1);

    const info: RegionInfo = {
      id,
      center: { x: center.x, y: center.y },
      biome: 'Plains', // Simplify for now, could sample Perlin
      name,
      wealth: rng.next(),
      danger: rng.next(),
    };

    // Cache (limit size in real impl)
    if (this.regionCache.size > 100) this.regionCache.clear();
    this.regionCache.set(id, info);

    return info;
  }

  /**
   * Check if there is a structure at this location.
   * A Structure exists at the Center of a Region if RNG permits.
   *
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @returns StructureRef if inside a structure's radius, null otherwise.
   */
  public getStructure(x: number, y: number): StructureRef | null {
    const region = this.getRegion(x, y);
    const rng = new Alea(region.id + '_struct');

    // Chance of structure in region center
    if (rng.next() > this.config.structureChance) return null;

    const typeRoll = rng.next();
    let type: StructureRef['type'] = 'village';
    let radius = 50;

    if (typeRoll > 0.9) {
      type = 'city';
      radius = 180;
    } else if (typeRoll > 0.7) {
      type = 'ruin';
      radius = 40;
    }

    // Check if (x,y) is within radius of region.center
    const dx = x - region.center.x;
    const dy = y - region.center.y;
    const distSq = dx * dx + dy * dy;

    if (distSq <= radius * radius) {
      return {
        type,
        name: region.name,
        radius,
        center: region.center,
        seed: region.id,
      };
    }

    return null;
  }

  /**
   * Get structure data for a specific grid cell indices.
   * Used by CivilizationGenerator to iterate potential structure sites.
   *
   * @param cx - Cell X index
   * @param cy - Cell Y index
   * @returns Stats and ID of the potential region center.
   */
  public getRegionStatsForCell(cx: number, cy: number): { center: { x: number; y: number; seed: string }; id: string } {
    const cellSize = Math.max(1, Math.floor(this.config.structureSpacing)) * this.config.chunkSize;
    const regionSeed = `${this.config.seed}_${cx}_${cy}`;
    const rng = new Alea(regionSeed);
    // Same jitter logic as getRegion
    const jitterX = (rng.next() - 0.5) * cellSize * 0.8;
    const jitterY = (rng.next() - 0.5) * cellSize * 0.8;

    return {
      center: {
        x: cx * cellSize + cellSize / 2 + jitterX,
        y: cy * cellSize + cellSize / 2 + jitterY,
        seed: regionSeed,
      },
      id: `${cx},${cy}`,
    };
  }

  /**
   * Deterministically retrieves structure info for a specific cell index, if one exists.
   *
   * @param cx - Cell X index
   * @param cy - Cell Y index
   * @returns StructureRef or null
   */
  public getStructureInCell(cx: number, cy: number): StructureRef | null {
    const { center, id } = this.getRegionStatsForCell(cx, cy);
    const stats = this.generateRegionData(id, center);

    const rng = new Alea(id + '_struct');
    if (rng.next() > this.config.structureChance) return null; // Use config chance

    const typeRoll = rng.next();
    let type: StructureRef['type'] = 'village';
    let radius = 50;

    if (typeRoll > 0.9) {
      type = 'city';
      radius = 180;
    } else if (typeRoll > 0.7) {
      type = 'ruin';
      radius = 40;
    }

    return {
      type,
      name: stats.name,
      radius,
      center: center,
      seed: id,
    };
  }
}
