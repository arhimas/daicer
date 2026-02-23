import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock factories
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreController: (uid: string, cfg: any) => {
      const mockStrapi = {};
      return cfg({ strapi: mockStrapi });
    },
  },
}));

vi.mock('../../../../services/unified-search-service', () => ({
  unifiedSearchService: {
    searchEntities: vi.fn(),
    search: vi.fn(),
  },
}));

import knowledgeSnippetController from '@/api/knowledge-snippet/controllers/knowledge-snippet';
import { unifiedSearchService } from '@/services/unified-search-service';

describe('KnowledgeSnippet Controller', () => {
  let controller: any;

  beforeEach(() => {
    controller = knowledgeSnippetController;
    vi.clearAllMocks();
  });

  describe('search', () => {
    it('should return 400 if q missing', async () => {
      const ctx = {
        query: {},
        badRequest: vi.fn(),
      };
      await controller.search(ctx);
      expect(ctx.badRequest).toHaveBeenCalledWith('Query param "q" is required');
    });

    it('should use searchEntities for legacy "entity" mode', async () => {
      const ctx = {
        query: { q: 'dragon', mode: 'entity' },
      };
      (unifiedSearchService.searchEntities as any).mockResolvedValue(['res1']);

      const res = await controller.search(ctx);
      expect(unifiedSearchService.searchEntities).toHaveBeenCalledWith('dragon', 5);
      expect(res).toEqual(['res1']);
    });

    it('should use basic search for unified mode', async () => {
      const ctx = {
        query: { q: 'lore' },
      };
      (unifiedSearchService.search as any).mockResolvedValue(['res2']);

      const res = await controller.search(ctx);
      expect(unifiedSearchService.search).toHaveBeenCalledWith('lore', { limit: 5, targets: undefined });
      expect(res).toEqual(['res2']);
    });

    it('should handle target filtering', async () => {
      const ctx = {
        query: { q: 'lore', targets: 'wiki,item' },
      };
      (unifiedSearchService.search as any).mockResolvedValue([]);

      await controller.search(ctx);
      expect(unifiedSearchService.search).toHaveBeenCalledWith('lore', { limit: 5, targets: ['wiki', 'item'] });
    });

    it('should handle internal errors', async () => {
      const ctx = {
        query: { q: 'crash' },
        internalServerError: vi.fn(),
      };
      (unifiedSearchService.search as any).mockRejectedValue(new Error('Boom'));

      await controller.search(ctx);
      expect(ctx.internalServerError).toHaveBeenCalledWith('Search failed');
    });
  });
});
