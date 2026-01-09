import { Alea, FastNoise } from '../voxel/utils/math';
import { WorldConfig } from '../types';

export interface RegionInfo {
  id: string; // "12,45"
  center: { x: number; y: number };
  biome: string; // "Forest"
  name: string; // "Eldoria"
  wealth: number; // 0-1
  danger: number; // 0-1
}

export interface StructureRef {
  type: 'city' | 'village' | 'ruin' | 'none';
  name: string;
  radius: number;
  center: { x: number; y: number };
  seed: string;
}

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
   * Uses Jittered Grid (Infinite Voronoi) approach.
   */
  /**
   * Get the region info for a world position.
   * Uses Jittered Grid (Infinite Voronoi) approach.
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
