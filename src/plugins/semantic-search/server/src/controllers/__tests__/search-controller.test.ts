import { describe, it, expect, vi, beforeEach } from 'vitest';
import searchControllerFactory from '@/plugins/semantic-search/server/src/controllers/search-controller';

const mockSearch = vi.fn();

const mockStrapi = {
  plugin: vi.fn((name) => {
    if (name === 'semantic-search') {
      return {
        service: vi.fn((serviceName) => {
          if (serviceName === 'searchService') return { search: mockSearch };
        }),
      };
    }
  }),
} as any;

describe('Search Controller', () => {
  let controller: any;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = searchControllerFactory({ strapi: mockStrapi });
  });

  it('should search via service and return results', async () => {
    mockSearch.mockResolvedValue([{ id: 1, title: 'Test' }]);

    const ctx = {
      request: {
        body: { query: 'test', targets: ['manual'] },
      },
      body: null,
      throw: vi.fn(),
    } as any;

    await controller.search(ctx);

    expect(mockSearch).toHaveBeenCalledWith({ query: 'test', targets: ['manual'], limit: undefined });
    expect(ctx.body).toEqual({
      meta: { count: 1 },
      data: [{ id: 1, title: 'Test' }],
    });
  });

  it('should handle service errors', async () => {
    mockSearch.mockRejectedValue(new Error('Search Failed'));

    const ctx = {
      request: { body: {} },
      throw: vi.fn(),
    } as any;

    await controller.search(ctx);

    expect(ctx.throw).toHaveBeenCalledWith(500, expect.any(Error));
  });
});
