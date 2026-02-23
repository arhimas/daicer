import mapControllerFactory from '@/plugins/map-explorer/server/src/controllers/map-controller';
import { describe, test, expect, vi, beforeAll, beforeEach } from 'vitest';

describe('Map Controller - Texture Generation', () => {
  let controller: any;
  let mockCtx: any;

  beforeAll(() => {
    // Mock strapi instance
    const mockStrapi = {
      plugin: vi.fn().mockReturnThis(),
      service: vi.fn().mockReturnThis(),
      log: {
        warn: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
    } as any;
    controller = mapControllerFactory({ strapi: mockStrapi });
  });

  beforeEach(() => {
    mockCtx = {
      request: { body: {} },
      body: null,
      badRequest: vi.fn(),
    };
  });

  const countFilledPixels = (tiles: any[][]) => {
    let count = 0;
    tiles.forEach((row) => {
      row.forEach((cell) => {
        if (cell && cell.block !== 'air') count++;
      });
    });
    return count;
  };

  const getDimensions = (tiles: any[][]) => {
    let minX = 32,
      maxX = 0,
      minY = 32,
      maxY = 0;
    tiles.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      });
    });
    return { width: maxX - minX + 1, height: maxY - minY + 1 };
  };

  test('should generate 2x2 for Tiny', async () => {
    mockCtx.request.body.size = 'Tiny';
    await controller.generateTexture(mockCtx);

    const tiles = mockCtx.body.tiles[0];
    expect(countFilledPixels(tiles)).toBe(2 * 2);
    const dim = getDimensions(tiles);
    expect(dim.width).toBe(2);
    expect(dim.height).toBe(2);
  });

  test('should generate 5x5 for Small', async () => {
    mockCtx.request.body.size = 'Small';
    await controller.generateTexture(mockCtx);

    const tiles = mockCtx.body.tiles[0];
    expect(countFilledPixels(tiles)).toBe(5 * 5);
    const dim = getDimensions(tiles);
    expect(dim.width).toBe(5);
    expect(dim.height).toBe(5);
  });

  test('should generate 5x5 for Medium', async () => {
    mockCtx.request.body.size = 'Medium';
    await controller.generateTexture(mockCtx);

    const tiles = mockCtx.body.tiles[0];
    expect(countFilledPixels(tiles)).toBe(5 * 5);
  });

  test('should generate 10x10 for Large', async () => {
    mockCtx.request.body.size = 'Large';
    await controller.generateTexture(mockCtx);

    const tiles = mockCtx.body.tiles[0];
    expect(countFilledPixels(tiles)).toBe(10 * 10);
    const dim = getDimensions(tiles);
    expect(dim.width).toBe(10);
    expect(dim.height).toBe(10);
  });

  test('should generate 15x15 for Huge', async () => {
    mockCtx.request.body.size = 'Huge';
    await controller.generateTexture(mockCtx);

    const tiles = mockCtx.body.tiles[0];
    expect(countFilledPixels(tiles)).toBe(15 * 15);
    const dim = getDimensions(tiles);
    expect(dim.width).toBe(15);
    expect(dim.height).toBe(15);
  });

  test('should generate 20x20 for Gargantuan', async () => {
    mockCtx.request.body.size = 'Gargantuan';
    await controller.generateTexture(mockCtx);

    const tiles = mockCtx.body.tiles[0];
    expect(countFilledPixels(tiles)).toBe(20 * 20);
    const dim = getDimensions(tiles);
    expect(dim.width).toBe(20);
    expect(dim.height).toBe(20);
  });

  test('should default to Medium (5x5) for unknown size', async () => {
    mockCtx.request.body.size = 'UnknownSize';
    await controller.generateTexture(mockCtx);

    const tiles = mockCtx.body.tiles[0];
    expect(countFilledPixels(tiles)).toBe(5 * 5);
  });
});
