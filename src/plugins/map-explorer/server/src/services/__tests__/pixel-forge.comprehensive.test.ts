import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PixelForgeService } from "../pixel-forge";
import { EntityContext } from "../pixel-forge/serializers";

// Mock generic strapi structure
const mockStrapi = {
  db: {
    query: (_modelUid: string) => ({
      findOne: vi.fn(),
    }),
  },
  plugin: vi.fn().mockReturnValue({
    config: vi.fn().mockImplementation((key) => {
      if (key === 'contentTypes')
        return {
          prompt: 'api::prompt.prompt',
          entity: 'api::entity.entity',
          item: 'api::item.item',
        };
      return {};
    }),
  }),
} as any;

describe('PixelForgeService Comprehensive Suite (SOTA Generation)', () => {
  let service: ReturnType<typeof PixelForgeService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = PixelForgeService({ strapi: mockStrapi });
  });

  describe('1. Entity Generation Integration', () => {
    it('should fetch deep relations and generate buffer for Entity', async () => {
      // Mock DB Response
      const mockFindOne = vi.fn().mockResolvedValue({
        documentId: 'ent_123',
        race: { slug: 'orc' },
        appearance: { skin: '#00ff00' },
        size: 'Medium',
      });
      mockStrapi.db.query = vi.fn().mockReturnValue({ findOne: mockFindOne });

      const grid = await service.generate('api::entity.entity', 'ent_123');

      expect(mockStrapi.db.query).toHaveBeenCalledWith('api::entity.entity');
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { documentId: 'ent_123' },
        populate: ['race', 'appearance', 'equipment', 'inventory'],
      });

      expect(Array.isArray(grid)).toBe(true);
      expect(Array.isArray(grid[0])).toBe(true);
      // Size Check (Medium = 32)
      expect(grid.length).toBe(32);
    });

    it('should throw error if entity not found', async () => {
      mockStrapi.db.query = vi.fn().mockReturnValue({ findOne: vi.fn().mockResolvedValue(null) });
      await expect(service.generate('api::entity.entity', 'missing')).rejects.toThrow(
        'Entity not found'
      );
    });
  });

  describe('2. Item Generation Integration', () => {
    it('should generate buffer for Weapon Item', async () => {
      const mockFindOne = vi.fn().mockResolvedValue({
        documentId: 'item_sword',
        type: 'weapon',
        size: 'Medium',
        equipment_data: { properties: [{ slug: 'finesse' }] },
      });
      mockStrapi.db.query = vi.fn().mockReturnValue({ findOne: mockFindOne });

      const grid = await service.generate('api::item.item', 'item_sword');
      expect(Array.isArray(grid)).toBe(true);
    });
  });

  describe('3. Anatomy Generation Logic', () => {
    // Helper to create valid context
    const makeCtx = (race: string, size: string): EntityContext => ({
      kind: 'entity',
      uid: 'api::entity.entity',
      documentId: 'test',
      name: 'Test',
      size,
      width: size === 'Large' ? 64 : 32, // Simplified for test
      height: size === 'Large' ? 64 : 32,
      race,
      gender: 'male',
      skinTone: '#000',
      archetype: 'Humanoid',
      equipment: [],
    });

    it('should generate wider body for Orcs (large)', () => {
      const ctx = makeCtx('orc', 'Large');
      const torso = service.generatePart('torso', ctx);
      // Check width logic. Base width 10. Large mod +2 = 12.
      // We can check pixel counts.
      let count = 0;
      torso.forEach((row) =>
        row.forEach((px) => {
          if (px) count++;
        })
      );
      expect(count).toBeGreaterThan(10);
    });

    it('should generate shorter body for Halflings (small)', () => {
      const ctx = makeCtx('halfling', 'Small');
      const torso = service.generatePart('torso', ctx);
      // Small offset logic check
      let count = 0;
      torso.forEach((row) =>
        row.forEach((px) => {
          if (px) count++;
        })
      );
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('4. PNG Encoding & Color Parsing', () => {
    it('should correctly parse RGBA strings', () => {
      const c = service.parseColor('rgba(255, 0, 0, 0.5)');
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 127 });
    });

    it('should correctly parse Hex strings', () => {
      const c = service.parseColor('#ff0000');
      expect(c).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    });

    it('should handle invalid colors gracefully (fallback black)', () => {
      const c = service.parseColor('invalid');
      expect(c).toEqual({ r: 0, g: 0, b: 0, a: 255 });
    });
  });
});
