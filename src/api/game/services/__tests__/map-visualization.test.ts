import { describe, it, expect } from 'vitest';
import { generateMapImage } from '@/api/game/services/map-visualization';
import type { Chunk, Player, Creature, Tile } from '@/api/game/services/src/engine';
import { PNG } from 'pngjs';

// Helper to create a mock chunk
const createMockChunk = (blockType = 'grass'): Chunk => {
  const tiles: Tile[][][] = []; // z, y, x
  // Just create enough layers. logic uses z=3.
  for (let z = 0; z < 5; z++) {
    const plane: Tile[][] = [];
    for (let y = 0; y < 32; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < 32; x++) {
        row.push({
          isWalkable: true,
          isTransparent: true,
          block: blockType,
          position: { x, y, z },
        } as Tile);
      }
      plane.push(row);
    }
    tiles.push(plane);
  }
  return { tiles } as Chunk;
};

describe('Map Visualization Service', () => {
  it('should generate a PNG buffer', async () => {
    const chunk = createMockChunk();
    const buffer = await generateMapImage(chunk, [], [], new Set(), { x: 16, y: 16 });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should render black for unexplored areas', async () => {
    const chunk = createMockChunk('grass');
    // No players, no explored tiles -> All black
    const buffer = await generateMapImage(chunk, [], [], new Set(), { x: 16, y: 16 });

    const png = PNG.sync.read(buffer);
    // Check center pixel (16, 16)
    const idx = (png.width * 16 + 16) << 2;
    expect(png.data[idx]).toBe(0); // R
    expect(png.data[idx + 1]).toBe(0); // G
    expect(png.data[idx + 2]).toBe(0); // B
    expect(png.data[idx + 3]).toBe(255); // Alpha
  });

  it('should render visible tiles correctly (Grass)', async () => {
    const chunk = createMockChunk('grass');
    const players: Player[] = [
      {
        id: 'p1',
        position: { x: 16, y: 16, z: 3 },
      } as any,
    ];

    const buffer = await generateMapImage(chunk, players, [], new Set(), { x: 16, y: 16 });
    const png = PNG.sync.read(buffer);

    // Pixel at 16,16 should be Visible (Player is there)
    // AND Player color is Green (0, 255, 0)
    // Let's check pixel at 15,15 which is adjacent and grass colored

    const idx = (png.width * 15 + 15) << 2;
    // Grass color: #14532d -> 20, 83, 45
    expect(png.data[idx]).toBe(20);
    expect(png.data[idx + 1]).toBe(83);
    expect(png.data[idx + 2]).toBe(45);
  });

  it('should render entities on top of tiles', async () => {
    const chunk = createMockChunk('grass');
    const players: Player[] = [
      {
        id: 'p1',
        position: { x: 16, y: 16, z: 3 },
      } as any,
    ];

    const buffer = await generateMapImage(chunk, players, [], new Set(), { x: 16, y: 16 });
    const png = PNG.sync.read(buffer);

    // Player location 16,16
    const idx = (png.width * 16 + 16) << 2;
    expect(png.data[idx]).toBe(0);
    expect(png.data[idx + 1]).toBe(255); // Green
    expect(png.data[idx + 2]).toBe(0);
  });

  it('should handle explored but invisible areas (dimmed)', async () => {
    const chunk = createMockChunk('stone');
    const explored = new Set(['16,16']);
    // Stone color: 68, 64, 60
    // Dimmed: * 0.4 -> 27, 25, 24

    const buffer = await generateMapImage(chunk, [], [], explored, { x: 16, y: 16 });
    const png = PNG.sync.read(buffer);

    const idx = (png.width * 16 + 16) << 2;
    // Allow potential rounding diffs
    expect(png.data[idx]).toBeCloseTo(27, -1);
    expect(png.data[idx + 1]).toBeCloseTo(25, -1);
    expect(png.data[idx + 2]).toBeCloseTo(24, -1);
  });

  it('should render creatures correctly', async () => {
    const chunk = createMockChunk('grass');
    const players: Player[] = [
      {
        id: 'p1',
        position: { x: 16, y: 16, z: 3 },
      } as any,
    ];
    const creature: Creature = {
      id: 'c1',
      hp: 10,
      position: { x: 17, y: 16, z: 3 },
    } as any;

    const buffer = await generateMapImage(chunk, players, [creature], new Set(), { x: 16, y: 16 });
    const png = PNG.sync.read(buffer);

    // Creature at 17,16 (Red)
    const idx = (png.width * 16 + 17) << 2; // y * width + x
    expect(png.data[idx]).toBe(255);
    expect(png.data[idx + 1]).toBe(0);
    expect(png.data[idx + 2]).toBe(0);
  });

  it('should render all block types with correct colors', async () => {
    const blockTypes = [
      { type: 'water', r: 30, g: 58, b: 138 },
      { type: 'sand', r: 217, g: 119, b: 6 },
      { type: 'snow', r: 229, g: 231, b: 235 },
      { type: 'wood_floor', r: 87, g: 83, b: 78 }, // includes 'floor'
      { type: 'stone_wall', r: 120, g: 113, b: 108 }, // includes 'wall'
      { type: 'unknown_block', r: 50, g: 50, b: 50 }, // default
    ];

    for (const { type, r, g, b } of blockTypes) {
      const chunk = createMockChunk(type);
      // Use a player to make it visible
      const players: Player[] = [
        {
          id: 'p1',
          position: { x: 16, y: 16, z: 3 },
        } as any,
      ];

      const buffer = await generateMapImage(chunk, players, [], new Set(), { x: 16, y: 16 });
      const png = PNG.sync.read(buffer);

      // Check pixel at 16,15 (adjacent to player, should be visible)
      const idx = (png.width * 16 + 15) << 2;
      expect(png.data[idx]).toBe(r);
      expect(png.data[idx + 1]).toBe(g);
      expect(png.data[idx + 2]).toBe(b);
    }
  });
});
