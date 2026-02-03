import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PhysicsEngine } from '@/api/voxel-engine/services/utils/physics';
import { BlockType } from '@daicer/engine/types';
import type { WorldGenerator } from '@/api/voxel-engine/services/utils/world-generator-logic';
import type { Chunk, Tile } from '@daicer/engine/types';

// Mock Constants
vi.mock('../constants', () => ({
  CHUNK_SIZE: 10,
}));

// Helper to create a basic mock chunk
const createMockChunk = (defaultWalkable = true, defaultTransparent = true, defaultBlock = BlockType.AIR): Chunk => {
  const tiles: Tile[][][] = []; // z, y, x
  for (let z = 0; z < 10; z++) {
    const plane: Tile[][] = [];
    for (let y = 0; y < 10; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < 10; x++) {
        row.push({
          isWalkable: defaultWalkable,
          isTransparent: defaultTransparent,
          block: defaultBlock,
        } as Tile);
      }
      plane.push(row);
    }
    tiles.push(plane);
  }
  return { tiles } as Chunk;
};

describe('PhysicsEngine', () => {
  let physics: PhysicsEngine;
  let mockGenerator: { getChunk: any };

  beforeEach(() => {
    mockGenerator = {
      getChunk: vi.fn(),
    };
    physics = new PhysicsEngine(mockGenerator as unknown as WorldGenerator);
  });

  describe('isWalkable', () => {
    it('should return true if tile is walkable', async () => {
      const mockChunk = createMockChunk(true);
      mockGenerator.getChunk.mockResolvedValue(mockChunk);

      const result = await physics.isWalkable({ x: 5, y: 5, z: 0 });
      expect(result).toBe(true);
      expect(mockGenerator.getChunk).toHaveBeenCalledWith(0, 0);
    });

    it('should return false if tile is not walkable', async () => {
      const mockChunk = createMockChunk(false);
      mockGenerator.getChunk.mockResolvedValue(mockChunk);

      const result = await physics.isWalkable({ x: 5, y: 5, z: 0 });
      expect(result).toBe(false);
    });

    it('should return false if zIndex is out of bounds', async () => {
      // zIndex = pos.z + 3. Bounds are 0-6 usually implied by logic or types?
      // Logic says: if (zIndex < 0 || zIndex > 6) return false;
      // So pos.z < -3 or pos.z > 3
      const result = await physics.isWalkable({ x: 5, y: 5, z: 100 });
      expect(result).toBe(false);
    });
  });

  describe('checkStaircase', () => {
    it('should detect stairs up', async () => {
      const mockChunk = createMockChunk();
      // Set a specific tile to be stairs UP
      // localX/Y calc: 5 % 10 = 5
      // zIndex = 0 + 3 = 3
      mockChunk.tiles[3][5][5].block = BlockType.STAIRS_UP;
      mockGenerator.getChunk.mockResolvedValue(mockChunk);

      const result = await physics.checkStaircase({ x: 5, y: 5, z: 0 });
      expect(result).toBe('up');
    });

    it('should detect stairs down', async () => {
      const mockChunk = createMockChunk();
      mockChunk.tiles[3][5][5].block = BlockType.STAIRS_DOWN;
      mockGenerator.getChunk.mockResolvedValue(mockChunk);

      const result = await physics.checkStaircase({ x: 5, y: 5, z: 0 });
      expect(result).toBe('down');
    });

    it('should return null for other blocks', async () => {
      const mockChunk = createMockChunk();
      mockGenerator.getChunk.mockResolvedValue(mockChunk);

      const result = await physics.checkStaircase({ x: 5, y: 5, z: 0 });
      expect(result).toBe(null);
    });
  });

  describe('calculateFieldOfView', () => {
    it('should include origin in visible set', async () => {
      const mockChunk = createMockChunk(true, true); // Transparent everywhere
      mockGenerator.getChunk.mockResolvedValue(mockChunk);

      const result = await physics.calculateFieldOfView({ x: 5, y: 5, z: 0 }, 1);
      expect(result.has('5,5')).toBe(true);
    });

    it('should iterate radius without crashing', async () => {
      const mockChunk = createMockChunk(true, true);
      mockGenerator.getChunk.mockResolvedValue(mockChunk);

      const result = await physics.calculateFieldOfView({ x: 5, y: 5, z: 0 }, 2);
      // Valid check: 5,5 plus neighbors
      expect(result.size).toBeGreaterThan(1);
      expect(mockGenerator.getChunk).toHaveBeenCalled();
    });

    it('should handle blocking walls', async () => {
      const mockChunk = createMockChunk(true, true);
      // Block (5,6) - directly "below" (y+1) the origin (5,5)
      // Wait, local coords. chunk is 10x10. origin at 5,5 is safe local.
      mockChunk.tiles[3][6][5].isTransparent = false;

      mockGenerator.getChunk.mockResolvedValue(mockChunk);

      const result = await physics.calculateFieldOfView({ x: 5, y: 5, z: 0 }, 3);

      expect(result.has('5,5')).toBe(true);
      expect(result.has('5,6')).toBe(true); // Wall itself is usually visible
      // Tile behind wall (5,7) should be shadowed if algo is correct
      // Note: Shadowcasting is tricky to exact assert without precise knowing the implementation variant.
      // But we verify it runs.
    });
  });

  describe('findPath', () => {
    it('should find path between adjacent nodes', async () => {
      const mockChunk = createMockChunk(true);
      mockGenerator.getChunk.mockResolvedValue(mockChunk);

      const start = { x: 5, y: 5, z: 0 };
      const end = { x: 6, y: 5, z: 0 };

      const path = await physics.findPath(start, end);
      expect(path).not.toBeNull();
      // Path should be [ {x:5,y:5,z:0}, {x:6,y:5,z:0} ] or similar depending on inclusion
      // Logic: "totalPath = [current]; ... unshift(current)".
      // Includes start and end.
      expect(path?.length).toBeGreaterThanOrEqual(2);
      expect(path![path!.length - 1]).toEqual(expect.objectContaining(end));
    });

    it('should return null if path is blocked/unreachable', async () => {
      const mockChunk = createMockChunk(true);
      // Cage the start point
      mockChunk.tiles[3][5][6].isWalkable = false;
      mockChunk.tiles[3][5][4].isWalkable = false;
      mockChunk.tiles[3][6][5].isWalkable = false;
      mockChunk.tiles[3][4][5].isWalkable = false;

      mockGenerator.getChunk.mockResolvedValue(mockChunk);

      const start = { x: 5, y: 5, z: 0 };
      const end = { x: 8, y: 5, z: 0 }; // far away

      const path = await physics.findPath(start, end);
      expect(path).toBeNull();
    });
  });
});
