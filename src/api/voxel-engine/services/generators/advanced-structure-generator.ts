import { Alea } from '../../src/utils/math';
import { BlockType, StructureInfo, Tile, BiomeType } from '../../../game/src/engine/types';
import { StructureRenderer } from './structure-renderer';

interface BiomeMaterials {
  wall: BlockType;
  floor: BlockType;
  wood: BlockType;
  roof: BlockType;
}

export class AdvancedStructureGenerator {
  public static generate(struct: StructureInfo, tiles: Tile[][][], cx: number, cy: number) {
    try {
      // 1. Determine Biome at structure center for context
      const mid = Math.floor(struct.size / 2);
      const centerTile = tiles[3] && tiles[3][mid] ? tiles[3][mid][mid] : null;
      const biome = centerTile?.biome || 'plains';

      const materials = this.getBiomeMaterials(biome as BiomeType);

      switch (struct.type) {
        case 'castle':
          this.generateHighDefCastle(struct, tiles, cx, cy, materials);
          break;
        case 'city':
          this.generateHighDefCity(struct, tiles, cx, cy, materials);
          break;
        case 'church':
          this.generateHighDefChurch(struct, tiles, cx, cy, materials);
          break;
        case 'tower':
          this.generateHighDefTower(struct, tiles, cx, cy, materials);
          break;
        case 'dungeon':
          this.generateHighDefDungeon(struct, tiles, cx, cy);
          break;
        case 'cave':
          this.generateHighDefCave(struct, tiles, cx, cy);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('AdvancedStructureGenerator Error:', err);
    }
  }

  private static getBiomeMaterials(biome: BiomeType): BiomeMaterials {
    switch (biome) {
      case 'desert':
      case 'badlands':
        return { wall: BlockType.SAND, floor: BlockType.SAND, wood: BlockType.CACTUS, roof: BlockType.SAND };
      case 'lava_wastes':
        return { wall: BlockType.STONE, floor: BlockType.LAVA, wood: BlockType.STONE, roof: BlockType.STONE };
      case 'forest':
      case 'mystic_forest':
        return {
          wall: BlockType.WALL_WOOD,
          floor: BlockType.FLOOR_WOOD,
          wood: BlockType.TREE_OAK,
          roof: BlockType.TREE_LEAVES,
        };
      case 'snowy_peaks':
      case 'tundra':
        return { wall: BlockType.SNOW, floor: BlockType.SNOW, wood: BlockType.TREE_PINE, roof: BlockType.SNOW };
      default:
        return {
          wall: BlockType.WALL_STONE,
          floor: BlockType.FLOOR_STONE,
          wood: BlockType.TREE_OAK,
          roof: BlockType.TREE_LEAVES,
        };
    }
  }

  // ... (Castle remains same but uses BiomeMaterials type implicitly if we update sig)

  private static generateHighDefCastle(
    s: StructureInfo,
    tiles: Tile[][][],
    cx: number,
    cy: number,
    mats: BiomeMaterials
  ) {
    // ...
    const margin = 2;
    const size = s.size;
    const wx = s.worldX;
    const wy = s.worldY;

    // 1. Walls
    const wallHeight = 20;

    StructureRenderer.stampBuilding(tiles, cx, cy, wx + margin, wy + margin, size - margin * 2, wallHeight, mats, true);

    for (let i = margin; i < size - margin; i += 2) {
      StructureRenderer.setBlock(tiles, cx, cy, wx + i, wy + margin, wallHeight, mats.wall);
      StructureRenderer.setBlock(tiles, cx, cy, wx + i, wy + size - margin - 1, wallHeight, mats.wall);
      StructureRenderer.setBlock(tiles, cx, cy, wx + margin, wy + i, wallHeight, mats.wall);
      StructureRenderer.setBlock(tiles, cx, cy, wx + size - margin - 1, wy + i, wallHeight, mats.wall);
    }

    const towerSize = 8;
    const towerHeight = 30;
    const corners = [
      { x: 0, y: 0 },
      { x: size - towerSize, y: 0 },
      { x: 0, y: size - towerSize },
      { x: size - towerSize, y: size - towerSize },
    ];

    corners.forEach((c) => {
      StructureRenderer.stampBuilding(tiles, cx, cy, wx + c.x, wy + c.y, towerSize, towerHeight, mats);
    });

    const keepSize = Math.floor(size / 2.5);
    const keepH = 40;
    const keepX = wx + (size - keepSize) / 2;
    const keepY = wy + (size - keepSize) / 2;
    StructureRenderer.stampBuilding(tiles, cx, cy, keepX, keepY, keepSize, keepH, mats);

    const gateW = 10;
    const gateX = wx + (size - gateW) / 2;
    const gateY = wy + size - margin - 2;
    StructureRenderer.stampBuilding(tiles, cx, cy, gateX, gateY, gateW, wallHeight + 5, mats);

    for (let z = 0; z < 12; z++) {
      for (let y = 0; y < 5; y++) {
        for (let x = 3; x < 7; x++) {
          StructureRenderer.setBlock(tiles, cx, cy, gateX + x, gateY + y, z, BlockType.AIR);
        }
      }
    }
  }

  private static generateHighDefChurch(
    s: StructureInfo,
    tiles: Tile[][][],
    cx: number,
    cy: number,
    mats: BiomeMaterials
  ) {
    const naveW = Math.floor(s.size * 0.4);
    const naveL = Math.floor(s.size * 0.8);
    const wx = s.worldX;
    const wy = s.worldY;
    const churchH = 25;

    const naveX = wx + (s.size - naveW) / 2;
    const naveY = wy + 5;

    StructureRenderer.stampBuilding(tiles, cx, cy, naveX, naveY, naveW, churchH, mats, true);
    for (let z = 0; z < churchH; z++) {
      for (let x = naveX; x < naveX + naveW; x++) {
        StructureRenderer.setBlock(tiles, cx, cy, x, naveY, z, BlockType.WALL_BRICK);
        StructureRenderer.setBlock(tiles, cx, cy, x, naveY + naveL - 1, z, BlockType.WALL_BRICK);
      }
      for (let y = naveY; y < naveY + naveL; y++) {
        StructureRenderer.setBlock(tiles, cx, cy, naveX, y, z, BlockType.WALL_BRICK);
        StructureRenderer.setBlock(tiles, cx, cy, naveX + naveW - 1, y, z, BlockType.WALL_BRICK);
      }
    }

    const steepleSize = 10;
    const steepleH = 60;
    const steepleX = wx + (s.size - steepleSize) / 2;
    const steepleY = naveY - steepleSize + 2;
    StructureRenderer.stampBuilding(tiles, cx, cy, steepleX, steepleY, steepleSize, steepleH, 'stone', true);

    StructureRenderer.setBlock(tiles, cx, cy, wx + s.size / 2, wy + naveL - 5, 1, BlockType.FLOOR_TILED);

    for (let y = 10; y < naveL - 10; y += 4) {
      for (let x = 2; x < naveW - 2; x++) {
        if (Math.abs(x - naveW / 2) < 2) continue;
        StructureRenderer.setBlock(tiles, cx, cy, naveX + x, naveY + y, 0, BlockType.FLOOR_WOOD);
      }
    }
  }

  private static generateHighDefCity(
    s: StructureInfo,
    tiles: Tile[][][],
    cx: number,
    cy: number,
    mats: BiomeMaterials
  ) {
    const rng = new Alea(s.seed);
    const districtSize = Math.floor(s.size / 2);
    const midX = s.size / 2;
    const midY = s.size / 2;

    const q1 = { x: s.worldX + midX, y: s.worldY };
    this.generateHighDefChurch(
      { ...s, worldX: q1.x + 5, worldY: q1.y + 5, size: districtSize - 10, type: 'church' },
      tiles,
      cx,
      cy,
      mats
    );

    const q3 = { x: s.worldX, y: s.worldY + midY };
    this.fillDistrictWithHouses(q3.x, q3.y, districtSize, tiles, cx, cy, rng, mats);

    const q4 = { x: s.worldX + midX, y: s.worldY + midY };
    this.fillDistrictWithHouses(q4.x, q4.y, districtSize, tiles, cx, cy, rng, mats);

    // Top-Left (Q2)
    this.fillDistrictWithHouses(s.worldX, s.worldY, districtSize, tiles, cx, cy, rng, mats);

    for (let i = 0; i < s.size; i++) {
      StructureRenderer.setBlock(tiles, cx, cy, s.worldX + i, s.worldY + midY, 0, BlockType.FLOOR_STONE);
      StructureRenderer.setBlock(tiles, cx, cy, s.worldX + midX, s.worldY + i, 0, BlockType.FLOOR_STONE);
    }
  }

  private static fillDistrictWithHouses(
    wx: number,
    wy: number,
    size: number,
    tiles: Tile[][][],
    cx: number,
    cy: number,
    rng: Alea,
    mats: BiomeMaterials
  ) {
    const houseSize = 12;
    const gap = 4;

    for (let y = 0; y < size - houseSize; y += houseSize + gap) {
      for (let x = 0; x < size - houseSize; x += houseSize + gap) {
        if (rng.next() > 0.7) continue;
        const h = 10 + Math.floor(rng.next() * 5);
        StructureRenderer.stampBuilding(
          tiles,
          cx,
          cy,
          wx + x,
          wy + y,
          houseSize,
          h,
          { wall: mats.wood, floor: mats.floor },
          true
        );
      }
    }
  }

  private static generateHighDefTower(
    s: StructureInfo,
    tiles: Tile[][][],
    cx: number,
    cy: number,
    mats: BiomeMaterials
  ) {
    StructureRenderer.stampBuilding(tiles, cx, cy, s.worldX, s.worldY, s.size, 50, mats, true);

    const midX = s.worldX + s.size / 2;
    const midY = s.worldY + s.size / 2;

    for (let z = 0; z < 50; z++) {
      const angle = z * 0.5;
      const sx = Math.floor(midX + Math.cos(angle) * (s.size / 2 - 2));
      const sy = Math.floor(midY + Math.sin(angle) * (s.size / 2 - 2));
      StructureRenderer.setBlock(tiles, cx, cy, sx, sy, z, BlockType.STAIRS_UP);
    }
  }

  /*
   * HIGH DEFINITION DUNGEON
   * - Surface Ruins (Entrance)
   * - Multi-level underground complex (Z-1 to Z-3)
   * - Stairs connecting levels
   * - Rooms and Corridors
   */
  private static generateHighDefDungeon(s: StructureInfo, tiles: Tile[][][], cx: number, cy: number) {
    const wx = s.worldX;
    const wy = s.worldY;
    const size = s.size;
    const rng = new Alea(s.seed + '_dungeon_adv');

    // 1. Surface Ruins (Stone Walls, partial height)
    StructureRenderer.stampBuilding(tiles, cx, cy, wx, wy, size, 3, 'stone', true);
    // Ruin it: randomly remove some blocks from top layers
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (rng.next() > 0.5) {
          StructureRenderer.setBlock(tiles, cx, cy, wx + x, wy + y, 2, BlockType.AIR);
        }
      }
    }

    // Entrance Stair descending
    const midX = wx + Math.floor(size / 2);
    const midY = wy + Math.floor(size / 2);
    StructureRenderer.setBlock(tiles, cx, cy, midX, midY, 0, BlockType.STAIRS_DOWN);

    // 2. Underground Levels (Z = -1, -2, -3)
    for (let z = -1; z >= -3; z--) {
      // Main Hall at center (Landing)
      const hallSize = 6;
      StructureRenderer.carveRoom(tiles, cx, cy, midX - 3, midY - 3, hallSize, hallSize, z);

      // Generate 3-5 rooms connected to main hall
      const rooms = 3 + Math.floor(rng.next() * 3);
      for (let i = 0; i < rooms; i++) {
        const w = 6 + Math.floor(rng.next() * 8);
        const h = 6 + Math.floor(rng.next() * 8);

        // Random position within bounds
        const rx = wx + Math.floor(rng.next() * (size - w));
        const ry = wy + Math.floor(rng.next() * (size - h));

        StructureRenderer.carveRoom(tiles, cx, cy, rx, ry, w, h, z);

        // Feature: Treasure placement!
        if (rng.next() < 0.4) {
          // Place chest in corner
          StructureRenderer.setBlock(tiles, cx, cy, rx, ry, z, BlockType.CHEST);
        }

        // Corridors? Ideally pathfind, but for now direct carve center-to-center
        // (Advanced Structure Gen implied better logic, let's do a simple L-corridor)
        const rCx = rx + w / 2;
        const rCy = ry + h / 2;

        // Horizontal then Vertical
        const startX = Math.min(midX, rCx);
        const endX = Math.max(midX, rCx);
        for (let x = startX; x <= endX; x++) {
          StructureRenderer.carveRoom(tiles, cx, cy, Math.floor(x), midY, 2, 2, z);
        }

        const startY = Math.min(midY, rCy);
        const endY = Math.max(midY, rCy);
        for (let y = startY; y <= endY; y++) {
          StructureRenderer.carveRoom(tiles, cx, cy, Math.floor(rCx), Math.floor(y), 2, 2, z);
        }
      }

      // Stairs
      if (Math.abs(z) % 2 === 1) {
        // Odd Levels (-1, -3): Stairs UP at Center, Stairs DOWN at Center+1 (if not bottom)
        StructureRenderer.setBlock(tiles, cx, cy, midX, midY, z, BlockType.STAIRS_UP);
        if (z > -3) StructureRenderer.setBlock(tiles, cx, cy, midX + 1, midY, z, BlockType.STAIRS_DOWN);
      } else {
        // Even Levels (-2): Stairs UP at Center+1, Stairs DOWN at Center
        StructureRenderer.setBlock(tiles, cx, cy, midX + 1, midY, z, BlockType.STAIRS_UP);
        if (z > -3) StructureRenderer.setBlock(tiles, cx, cy, midX, midY, z, BlockType.STAIRS_DOWN);
      }
    }
  }

  /*
   * NATURAL CAVERNS
   * - Organic shapes
   * - Ores
   * - Mushrooms
   */
  public static generateHighDefCave(s: StructureInfo, tiles: Tile[][][], cx: number, cy: number) {
    // Implement organic cellular automata or random worm for caves
    // For now, simpler worm walker
    const rng = new Alea(s.seed + '_cave');
    const layers = [-1, -2, -3];

    layers.forEach((z) => {
      let cxWorm = s.worldX + Math.floor(s.size / 2);
      let cyWorm = s.worldY + Math.floor(s.size / 2);

      for (let steps = 0; steps < 200; steps++) {
        // Carve current pos
        StructureRenderer.carveRoom(tiles, cx, cy, cxWorm, cyWorm, 2, 2, z);

        // Random Ores nearby
        if (rng.next() < 0.05) {
          StructureRenderer.setBlock(tiles, cx, cy, cxWorm + 2, cyWorm, z, BlockType.ORE_IRON);
        }
        if (rng.next() < 0.02) {
          StructureRenderer.setBlock(tiles, cx, cy, cxWorm, cyWorm + 2, z, BlockType.ORE_GOLD);
        }

        // Move
        cxWorm += Math.floor(rng.next() * 3) - 1;
        cyWorm += Math.floor(rng.next() * 3) - 1;

        // Clamp
        cxWorm = Math.max(s.worldX, Math.min(s.worldX + s.size - 2, cxWorm));
        cyWorm = Math.max(s.worldY, Math.min(s.worldY + s.size - 2, cyWorm));
      }
    });
  }
}
