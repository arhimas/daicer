import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PixelForgeService } from '../pixel-forge';

// Mock Strapi
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

describe('PixelForge Verification (Phase 5)', () => {
  let service: ReturnType<typeof PixelForgeService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = PixelForgeService({ strapi: mockStrapi });
  });

  describe('Legacy Smoke Test (32x32)', () => {
    it('should generate a 32x32 grid for a Medium entity', async () => {
      // Mock Medium Entity
      const mockFindOne = vi.fn().mockResolvedValue({
        documentId: 'medium_hero',
        size: 'Medium', // 1ft = 32px
        race: { slug: 'human' },
        equipment: [],
      });
      mockStrapi.db.query = vi.fn().mockReturnValue({ findOne: mockFindOne });

      const grid = await service.generate('api::entity.entity', 'medium_hero');

      expect(grid.length).toBe(32);
      expect(grid[0].length).toBe(32);
    });
  });

  describe('SOTA Integration Test (64x64)', () => {
    it('should generate a 64x64 grid for a Large entity', async () => {
      // Mock Large Entity (e.g., Ogre)
      const mockFindOne = vi.fn().mockResolvedValue({
        documentId: 'large_ogre',
        size: 'Large', // 2ft = 64px
        race: { slug: 'orc' },
        equipment: [],
      });
      mockStrapi.db.query = vi.fn().mockReturnValue({ findOne: mockFindOne });

      const grid = await service.generate('api::entity.entity', 'large_ogre');

      expect(grid.length).toBe(64);
      expect(grid[0].length).toBe(64);
    });

    it('should composite a 32x32 item onto a 64x64 entity correctly', async () => {
      // Mock Large Entity with Sword
      const mockEntity = {
        documentId: 'large_ogre_warrior',
        size: 'Large',
        race: { slug: 'orc' },
        equipment: [{ documentId: 'tiny_sword', type: 'weapon' }],
      };

      const mockItem = {
        documentId: 'tiny_sword',
        type: 'weapon',
        size: 'Medium', // Standard item size
        equipment_data: { properties: [] },
      };

      // Dynamic Mock Routing
      const queryFn = vi.fn((uid) => {
        if (uid === 'api::entity.entity') return { findOne: vi.fn().mockResolvedValue(mockEntity) };
        if (uid === 'api::item.item') return { findOne: vi.fn().mockResolvedValue(mockItem) };
        return { findOne: vi.fn() };
      });
      mockStrapi.db.query = queryFn;

      const grid = await service.generate('api::entity.entity', 'large_ogre_warrior');

      expect(grid.length).toBe(64);

      // Verify content exists (not empty)
      let hasContent = false;
      for (const row of grid) {
        for (const cell of row) {
          if (cell) hasContent = true;
        }
      }
      expect(hasContent).toBe(true);
    });
  });
});
