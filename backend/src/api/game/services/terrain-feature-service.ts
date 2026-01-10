/**
 * Terrain Feature Service
 * Bridges procedural generation (FloraGenerator) with persistent world state (ChunkManager).
 */

import { Core } from '@strapi/strapi';
import { BlockType, Tile } from '../../game/src/engine/types';
import { FloraGenerator } from '../../voxel-engine/services/generators/flora-generator';

// Inline Alea to avoid fragile cross-api relative imports during seeding
class Alea {
  c: number;
  s0: number;
  s1: number;
  s2: number;

  constructor(seed: string) {
    this.c = 1;
    const mash = Mash();
    this.s0 = mash(' ');
    this.s1 = mash(' ');
    this.s2 = mash(' ');

    this.s0 -= mash(seed);
    if (this.s0 < 0) {
      this.s0 += 1;
    }
    this.s1 -= mash(seed);
    if (this.s1 < 0) {
      this.s1 += 1;
    }
    this.s2 -= mash(seed);
    if (this.s2 < 0) {
      this.s2 += 1;
    }
    mash(null);
  }

  next(): number {
    const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
    this.s0 = this.s1;
    this.s1 = this.s2;
    return (this.s2 = t - (this.c = t | 0));
  }

  uint32(): number {
    return this.next() * 0x100000000; // 2^32
  }

  fract53(): number {
    return this.next() + ((this.next() * 0x200000) | 0) * 1.1102230246251565e-16; // 2^-53
  }
}

function Mash() {
  let n = 0xefc8249d;
  const mash = (data: string | null) => {
    if (data) {
      for (let i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        let h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    } else {
      n = 0xefc8249d;
    }
  };
  return mash;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Spawns a terrain feature (Tree, Rock) or Entity Flora at the given location.
   */
  async spawnFeature(roomId: string, type: string, subtype: string, position: { x: number; y: number; z: number }) {
    // 1. Check for Entity Blueprint first (The "Hybrid Strategy")
    // If subtype matches a known monster (e.g. "Awakened Tree"), spawn it as an entity.
    const slug = subtype.toLowerCase().replace(/ /g, '-');

    // Quick DB check for monster blueprint
    const blueprint = await strapi.db.query('api::entity.entity').findOne({
      where: {
        $or: [
          { slug: slug },
          { name: { $containsi: subtype } }, // Fuzzy match
        ],
      },
    });

    if (blueprint && ['plant', 'construct', 'elemental', 'beast'].includes(blueprint.type)) {
      // It's a creature! Spawn it.
      const spawnService = strapi.service('api::game.spawn-service');
      return await (spawnService as any).spawn(roomId, {
        blueprintId: blueprint.documentId,
        type: 'monster',
        position,
      });
    }

    // 2. Fallback to Voxel Generation (FloraGenerator)
    // We need to map 'subtype' to a BlockType if possible, or use heuristics.
    let blockType: BlockType;

    // Simple Mapping
    const map: Record<string, BlockType> = {
      oak: BlockType.TREE_OAK,
      birch: BlockType.TREE_BIRCH,
      pine: BlockType.TREE_PINE,
      palm: BlockType.TREE_PALM,
      cactus: BlockType.CACTUS,
      rock: BlockType.ROCK_MOSSY, // Default rock
      granite: BlockType.ROCK_GRANITE,
      gold: BlockType.ORE_GOLD,
    };

    blockType = map[subtype.toLowerCase()] || map[type.toLowerCase()] || BlockType.TREE_OAK;

    // 3. Create Virtual Grid (Canvas)
    // FloraGenerator expects a large grid, usually 16x16xWorldHeight.
    // We will make a localized buffer. The generator writes relative to cx, cy.
    // Let's emulate a chunk wrapper.
    const startX = position.x;
    const startY = position.y;
    const centerZ = position.z;

    // We assume the generator works on a standard chunks' worth of tiles?
    // Actually FloraGenerator.generate takes (tiles, cx, cy, wx, wy, z, type, rng)
    // We can pass a dummy 3D array large enough to hold the tree.
    const bufferSize = 16;
    const tiles: Tile[][][] = [];

    // Initialize empty buffer
    for (let z = 0; z < bufferSize; z++) {
      tiles[z] = [];
      for (let y = 0; y < bufferSize; y++) {
        tiles[z][y] = [];
        for (let x = 0; x < bufferSize; x++) {
          tiles[z][y][x] = {
            x: startX + x - 8,
            y: startY + y - 8,
            z: centerZ + z,
            block: BlockType.AIR,
            biome: 'plains', // Arbitrary
            isWalkable: true,
            isTransparent: true,
          };
        }
      }
    }

    // 4. Run Generator
    // We position the tree at the center of the buffer (8, 8) at z=0 (relative)
    const rng = new Alea(Date.now().toString());

    // Map subtypes to specific generator calls if needed, or rely on BlockType
    // FloraGenerator.generate handles switching by BlockType prefix (TREE_, PLANT_, ROCK_)
    FloraGenerator.generate(
      tiles,
      0,
      0, // Chunk offset (irrelevant for buffer)
      8,
      8, // World X,Y (relative to buffer start) - wait, generate uses them for noise?
      // The generate method uses wx, wy for placement in the array.
      // It effectively does `tiles[z][wy-cy][wx-cx]`.
      // unique usage: tiles, cx, cy, wx, wy...
      // target array index is [z][wy - cy][wx - cx]
      0, // Z start (relative)
      blockType,
      rng as any
    );

    // 5. Diff & Persist
    // Scan buffer for non-AIR blocks
    const voxelChanges: any[] = [];

    for (let z = 0; z < bufferSize; z++) {
      for (let y = 0; y < bufferSize; y++) {
        for (let x = 0; x < bufferSize; x++) {
          const block = tiles[z][y][x].block;
          if (block !== BlockType.AIR) {
            // Calculate real world position
            // Buffer (8,8,0) = Target (pos.x, pos.y, pos.z)
            // Offset = x - 8, y - 8, z - 0
            const rwX = position.x + (x - 8);
            const rwY = position.y + (y - 8);
            const rwZ = position.z + z;

            voxelChanges.push({
              x: rwX,
              y: rwY,
              z: rwZ,
              type: block,
            });
          }
        }
      }
    }

    // Apply via ChunkManager (batch would be better, but loop is fine for single tree)
    const chunkManager = strapi.service('api::voxel-engine.chunk-manager');
    const roomIdNum = parseInt(roomId); // Assuming room ID matches chunk logic?
    // Actually persistent editing usually goes by chunk coordinates.
    // We ignore RoomID for world editing ?? Or verify room?
    // Let's assume global world for now (Single Room mode usually).

    for (const change of voxelChanges) {
      await (chunkManager as any).editVoxel(change.x, change.y, change.z, change.type);
    }

    return { success: true, changes: voxelChanges.length, type: blockType };
  },
});
