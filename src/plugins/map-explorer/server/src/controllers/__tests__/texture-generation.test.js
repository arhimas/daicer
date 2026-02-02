"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const map_controller_1 = __importDefault(require("../map-controller"));
const vitest_1 = require("vitest");
(0, vitest_1.describe)('Map Controller - Texture Generation', () => {
    let controller;
    let mockCtx;
    (0, vitest_1.beforeAll)(() => {
        // Mock strapi instance
        const mockStrapi = {
            plugin: vitest_1.vi.fn().mockReturnThis(),
            service: vitest_1.vi.fn().mockReturnThis(),
            log: {
                warn: vitest_1.vi.fn(),
                info: vitest_1.vi.fn(),
                error: vitest_1.vi.fn(),
                debug: vitest_1.vi.fn(),
            }
        };
        controller = (0, map_controller_1.default)({ strapi: mockStrapi });
    });
    (0, vitest_1.beforeEach)(() => {
        mockCtx = {
            request: { body: {} },
            body: null,
            badRequest: vitest_1.vi.fn(),
        };
    });
    const countFilledPixels = (tiles) => {
        let count = 0;
        tiles.forEach(row => {
            row.forEach(cell => {
                if (cell && cell.block !== 'air')
                    count++;
            });
        });
        return count;
    };
    const getDimensions = (tiles) => {
        let minX = 32, maxX = 0, minY = 32, maxY = 0;
        tiles.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    if (x < minX)
                        minX = x;
                    if (x > maxX)
                        maxX = x;
                    if (y < minY)
                        minY = y;
                    if (y > maxY)
                        maxY = y;
                }
            });
        });
        return { width: maxX - minX + 1, height: maxY - minY + 1 };
    };
    (0, vitest_1.test)('should generate 2x2 for Tiny', async () => {
        mockCtx.request.body.size = 'Tiny';
        await controller.generateTexture(mockCtx);
        const tiles = mockCtx.body.tiles[0];
        (0, vitest_1.expect)(countFilledPixels(tiles)).toBe(2 * 2);
        const dim = getDimensions(tiles);
        (0, vitest_1.expect)(dim.width).toBe(2);
        (0, vitest_1.expect)(dim.height).toBe(2);
    });
    (0, vitest_1.test)('should generate 5x5 for Small', async () => {
        mockCtx.request.body.size = 'Small';
        await controller.generateTexture(mockCtx);
        const tiles = mockCtx.body.tiles[0];
        (0, vitest_1.expect)(countFilledPixels(tiles)).toBe(5 * 5);
        const dim = getDimensions(tiles);
        (0, vitest_1.expect)(dim.width).toBe(5);
        (0, vitest_1.expect)(dim.height).toBe(5);
    });
    (0, vitest_1.test)('should generate 5x5 for Medium', async () => {
        mockCtx.request.body.size = 'Medium';
        await controller.generateTexture(mockCtx);
        const tiles = mockCtx.body.tiles[0];
        (0, vitest_1.expect)(countFilledPixels(tiles)).toBe(5 * 5);
    });
    (0, vitest_1.test)('should generate 10x10 for Large', async () => {
        mockCtx.request.body.size = 'Large';
        await controller.generateTexture(mockCtx);
        const tiles = mockCtx.body.tiles[0];
        (0, vitest_1.expect)(countFilledPixels(tiles)).toBe(10 * 10);
        const dim = getDimensions(tiles);
        (0, vitest_1.expect)(dim.width).toBe(10);
        (0, vitest_1.expect)(dim.height).toBe(10);
    });
    (0, vitest_1.test)('should generate 15x15 for Huge', async () => {
        mockCtx.request.body.size = 'Huge';
        await controller.generateTexture(mockCtx);
        const tiles = mockCtx.body.tiles[0];
        (0, vitest_1.expect)(countFilledPixels(tiles)).toBe(15 * 15);
        const dim = getDimensions(tiles);
        (0, vitest_1.expect)(dim.width).toBe(15);
        (0, vitest_1.expect)(dim.height).toBe(15);
    });
    (0, vitest_1.test)('should generate 20x20 for Gargantuan', async () => {
        mockCtx.request.body.size = 'Gargantuan';
        await controller.generateTexture(mockCtx);
        const tiles = mockCtx.body.tiles[0];
        (0, vitest_1.expect)(countFilledPixels(tiles)).toBe(20 * 20);
        const dim = getDimensions(tiles);
        (0, vitest_1.expect)(dim.width).toBe(20);
        (0, vitest_1.expect)(dim.height).toBe(20);
    });
    (0, vitest_1.test)('should default to Medium (5x5) for unknown size', async () => {
        mockCtx.request.body.size = 'UnknownSize';
        await controller.generateTexture(mockCtx);
        const tiles = mockCtx.body.tiles[0];
        (0, vitest_1.expect)(countFilledPixels(tiles)).toBe(5 * 5);
    });
});
