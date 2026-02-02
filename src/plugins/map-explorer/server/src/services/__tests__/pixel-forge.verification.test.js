"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const pixel_forge_1 = require("../pixel-forge");
// Mock Strapi
const mockStrapi = {
    db: {
        query: (_modelUid) => ({
            findOne: vitest_1.vi.fn(),
        }),
    },
};
(0, vitest_1.describe)('PixelForge Verification (Phase 5)', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = (0, pixel_forge_1.PixelForgeService)({ strapi: mockStrapi });
    });
    (0, vitest_1.describe)('Legacy Smoke Test (32x32)', () => {
        (0, vitest_1.it)('should generate a 32x32 grid for a Medium entity', async () => {
            // Mock Medium Entity
            const mockFindOne = vitest_1.vi.fn().mockResolvedValue({
                documentId: 'medium_hero',
                size: 'Medium', // 1ft = 32px
                race: { slug: 'human' },
                equipment: []
            });
            mockStrapi.db.query = vitest_1.vi.fn().mockReturnValue({ findOne: mockFindOne });
            const grid = await service.generateEntity('medium_hero');
            (0, vitest_1.expect)(grid.length).toBe(32);
            (0, vitest_1.expect)(grid[0].length).toBe(32);
        });
    });
    (0, vitest_1.describe)('SOTA Integration Test (64x64)', () => {
        (0, vitest_1.it)('should generate a 64x64 grid for a Large entity', async () => {
            // Mock Large Entity (e.g., Ogre)
            const mockFindOne = vitest_1.vi.fn().mockResolvedValue({
                documentId: 'large_ogre',
                size: 'Large', // 2ft = 64px
                race: { slug: 'orc' },
                equipment: []
            });
            mockStrapi.db.query = vitest_1.vi.fn().mockReturnValue({ findOne: mockFindOne });
            const grid = await service.generateEntity('large_ogre');
            (0, vitest_1.expect)(grid.length).toBe(64);
            (0, vitest_1.expect)(grid[0].length).toBe(64);
        });
        (0, vitest_1.it)('should composite a 32x32 item onto a 64x64 entity correctly', async () => {
            // Mock Large Entity with Sword
            const mockEntity = {
                documentId: 'large_ogre_warrior',
                size: 'Large',
                race: { slug: 'orc' },
                equipment: [
                    { documentId: 'tiny_sword', type: 'weapon' }
                ]
            };
            const mockItem = {
                documentId: 'tiny_sword',
                type: 'weapon',
                size: 'Medium', // Standard item size
                equipment_data: { properties: [] }
            };
            // Dynamic Mock Routing
            const queryFn = vitest_1.vi.fn((uid) => {
                if (uid === 'api::entity.entity')
                    return { findOne: vitest_1.vi.fn().mockResolvedValue(mockEntity) };
                if (uid === 'api::item.item')
                    return { findOne: vitest_1.vi.fn().mockResolvedValue(mockItem) };
                return { findOne: vitest_1.vi.fn() };
            });
            mockStrapi.db.query = queryFn;
            const grid = await service.generateEntity('large_ogre_warrior');
            (0, vitest_1.expect)(grid.length).toBe(64);
            // Verify content exists (not empty)
            let hasContent = false;
            for (const row of grid) {
                for (const cell of row) {
                    if (cell)
                        hasContent = true;
                }
            }
            (0, vitest_1.expect)(hasContent).toBe(true);
        });
    });
});
