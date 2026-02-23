/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { Alea } from '@/api/voxel-engine/src/utils/math';
import { StructureInfo, Tile, WorldConfig } from '@daicer/engine/types';
import { AdvancedStructureGenerator } from '@/api/voxel-engine/services/generators/advanced-structure-generator';

export class StructureService {
  constructor(private config: WorldConfig) {}

  /**
   * Determines the major structure (if any) for a given region.
   * Uses deterministic RNG based on region coordinates.
   *
   * @param regionX - Region X.
   * @param regionY - Region Y.
   * @param regionSize - Size of the region in tiles.
   * @returns StructureInfo describing type, position, and size.
   */
  public getRegionStructure(regionX: number, regionY: number, regionSize: number): StructureInfo {
    // Unique seed for this region's structure
    const seed = `${this.config.seed}_reg_${regionX}_${regionY}`;
    const rng = new Alea(seed);

    // Chance check
    if (rng.next() > this.config.structureChance) {
      return { type: 'none', worldX: 0, worldY: 0, size: 0, seed };
    }

    // Position: Center-biased random within region
    const padding = 20;
    const availableSize = Math.max(10, regionSize - padding * 2);
    const offsetX = Math.floor(rng.next() * availableSize) + padding;
    const offsetY = Math.floor(rng.next() * availableSize) + padding;

    const worldX = regionX * regionSize + offsetX;
    const worldY = regionY * regionSize + offsetY;

    // Type Selection (Weighted)
    const roll = rng.next();
    let type: StructureInfo['type'] = 'tower';
    let baseSize = this.config.structureSizeAvg;

    if (roll < 0.25) {
      type = 'city';
      baseSize = Math.floor(baseSize * 3);
    } else if (roll < 0.45) {
      type = 'castle';
      baseSize = Math.floor(baseSize * 2.5);
    } else if (roll < 0.7) {
      type = 'dungeon';
      baseSize = Math.floor(baseSize * 1.5);
    } else {
      type = 'tower';
      baseSize = Math.floor(baseSize * 1.2);
    }

    // Clamp size logic
    const size = Math.min(regionSize - 4, Math.max(8, baseSize));

    return { type, worldX, worldY, size, seed };
  }

  public renderStructure(struct: StructureInfo, tiles: Tile[][][], cx: number, cy: number): void {
    if (!this.intersects(cx, cy, this.config.chunkSize, struct.worldX, struct.worldY, struct.size)) {
      return;
    }

    // Use SOTA Generator for everything
    AdvancedStructureGenerator.generate(struct, tiles, cx, cy);
  }

  public intersects(x1: number, y1: number, s1: number, x2: number, y2: number, s2: number): boolean {
    return x1 < x2 + s2 && x1 + s1 > x2 && y1 < y2 + s2 && y1 + s1 > y2;
  }
}
