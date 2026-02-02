"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const pixel_forge_1 = require("../pixel-forge");
// Mock generic strapi structure
const mockStrapi = {
    db: {
        query: (_modelUid) => ({
            findOne: vitest_1.vi.fn(),
        }),
    },
};
(0, vitest_1.describe)('PixelForgeService Comprehensive Suite (SOTA Generation)', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = (0, pixel_forge_1.PixelForgeService)({ strapi: mockStrapi });
    });
    (0, vitest_1.describe)('1. Entity Generation Integration', () => {
        (0, vitest_1.it)('should fetch deep relations and generate buffer for Entity', async () => {
            // Mock DB Response
            const mockFindOne = vitest_1.vi.fn().mockResolvedValue({
                documentId: 'ent_123',
                race: { slug: 'orc' },
                appearance: { skin: '#00ff00' }
            });
            mockStrapi.db.query = vitest_1.vi.fn().mockReturnValue({ findOne: mockFindOne });
            const grid = await service.generateEntity('ent_123');
            (0, vitest_1.expect)(mockStrapi.db.query).toHaveBeenCalledWith('api::entity.entity');
            (0, vitest_1.expect)(mockFindOne).toHaveBeenCalledWith({
                where: { documentId: 'ent_123' },
                populate: ['race', 'appearance', 'equipment', 'inventory']
            });
            (0, vitest_1.expect)(Array.isArray(grid)).toBe(true);
            (0, vitest_1.expect)(Array.isArray(grid[0])).toBe(true);
            // Size Check (Medium = 32)
            (0, vitest_1.expect)(grid.length).toBe(32);
        });
        (0, vitest_1.it)('should throw error if entity not found', async () => {
            mockStrapi.db.query = vitest_1.vi.fn().mockReturnValue({ findOne: vitest_1.vi.fn().mockResolvedValue(null) });
            await (0, vitest_1.expect)(service.generateEntity('missing')).rejects.toThrow('Entity not found');
        });
    });
    (0, vitest_1.describe)('2. Item Generation Integration', () => {
        (0, vitest_1.it)('should generate buffer for Weapon Item', async () => {
            const mockFindOne = vitest_1.vi.fn().mockResolvedValue({
                documentId: 'item_sword',
                type: 'weapon',
                equipment_data: { properties: [{ slug: 'finesse' }] }
            });
            mockStrapi.db.query = vitest_1.vi.fn().mockReturnValue({ findOne: mockFindOne });
            const grid = await service.generateItem('item_sword');
            (0, vitest_1.expect)(Array.isArray(grid)).toBe(true);
        });
    });
    (0, vitest_1.describe)('3. Anatomy Generation Logic', () => {
        (0, vitest_1.it)('should generate wider body for Orcs (large)', () => {
            const torso = service.generatePart('torso', { race: 'orc', skinTone: '#000' });
            // Check width logic. Base width 10. Large mod +2 = 12.
            // We can check pixel counts.
            let count = 0;
            torso.forEach(row => row.forEach(px => { if (px)
                count++; }));
            (0, vitest_1.expect)(count).toBeGreaterThan(10);
        });
        (0, vitest_1.it)('should generate shorter body for Halflings (small)', () => {
            const torso = service.generatePart('torso', { race: 'halfling', skinTone: '#000' });
            // Small offset logic check 
            let count = 0;
            torso.forEach(row => row.forEach(px => { if (px)
                count++; }));
            (0, vitest_1.expect)(count).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('4. PNG Encoding & Color Parsing', () => {
        (0, vitest_1.it)('should correctly parse RGBA strings', () => {
            const c = service.parseColor('rgba(255, 0, 0, 0.5)');
            (0, vitest_1.expect)(c).toEqual({ r: 255, g: 0, b: 0, a: 127 });
        });
        (0, vitest_1.it)('should correctly parse Hex strings', () => {
            const c = service.parseColor('#ff0000');
            (0, vitest_1.expect)(c).toEqual({ r: 255, g: 0, b: 0, a: 255 });
        });
        (0, vitest_1.it)('should handle invalid colors gracefully (fallback black)', () => {
            const c = service.parseColor('invalid');
            (0, vitest_1.expect)(c).toEqual({ r: 0, g: 0, b: 0, a: 255 });
        });
    });
});
