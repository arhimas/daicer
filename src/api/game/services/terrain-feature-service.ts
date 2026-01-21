import { Core } from '@strapi/strapi';
import { BlockType, Tile, ZLevel } from '../../game/src/engine/types';
import { FloraGenerator } from '../../voxel-engine/services/generators/flora-generator';
import { Alea } from '../../voxel-engine/src/utils/math';

// Interface Definitions for Dependencies
interface SpawnService {
  spawn(
    roomId: string,
    payload: {
      blueprintId: string;
      type: 'monster' | 'character';
      position: { x: number; y: number; z: number };
      ownerId?: string;
    }
  ): Promise<unknown>;
}

interface ChunkManager {
  editVoxel(
    chunkX: number,
    chunkY: number,
    localX: number,
    localY: number,
    z: number,
    type: BlockType,
    source?: string
  ): Promise<void>;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Spawns a terrain feature (Tree, Rock) or flora at the given location.
   * Uses a hybrid strategy: checks for Entity Blueprints first, then falls back to Voxel/Flora buffers.
   *
   * @param roomId - The room context.
   * @param type - The general type (e.g. 'tree').
   * @param subtype - The specific subtype (e.g. 'oak').
   * @param position - The target coordinates.
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
      const spawnService = strapi.service('api::game.spawn-service') as unknown as SpawnService;

      return await spawnService.spawn(roomId, {
        blueprintId: blueprint.documentId,
        type: 'monster',
        position,
      });
    }

    // 2. Fallback to Voxel Generation (FloraGenerator)
    // We need to map 'subtype' to a BlockType if possible, or use heuristics.

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

    const blockType = map[subtype.toLowerCase()] || map[type.toLowerCase()] || BlockType.TREE_OAK;

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
            z: (centerZ + z) as unknown as ZLevel,
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
      rng as unknown as Alea
    );

    // 5. Diff & Persist
    // Scan buffer for non-AIR blocks
    const voxelChanges: { x: number; y: number; z: number; type: BlockType }[] = [];

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
              type: block as BlockType,
            });
          }
        }
      }
    }

    // Apply via ChunkManager (batch would be better, but loop is fine for single tree)
    const chunkManager = strapi.service('api::voxel-engine.chunk-manager') as unknown as ChunkManager;
    // const roomIdNum = parseInt(roomId);
    // Actually persistent editing usually goes by chunk coordinates.
    // We ignore RoomID for world editing ?? Or verify room?
    // Let's assume global world for now (Single Room mode usually).

    const chunkSize = 16; // Hardcoded default for now

    for (const change of voxelChanges) {
      const chunkX = Math.floor(change.x / chunkSize);
      const chunkY = Math.floor(change.y / chunkSize);
      const localX = ((change.x % chunkSize) + chunkSize) % chunkSize;
      const localY = ((change.y % chunkSize) + chunkSize) % chunkSize;

      await chunkManager.editVoxel(chunkX, chunkY, localX, localY, change.z, change.type, 'TerrainFeature');
    }

    return { success: true, changes: voxelChanges.length, type: blockType };
  },
});
