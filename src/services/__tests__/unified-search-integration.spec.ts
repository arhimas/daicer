import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { unifiedSearchService } from '@/services/unified-search-service';

// Mock Services
const mockPluginSearch = vi.fn();

const mockStrapi = {
  log: {
    error: vi.fn(),
  },
  plugin: vi.fn().mockImplementation((pluginName) => {
    if (pluginName === 'semantic-search') {
      return {
        service: vi.fn().mockImplementation((serviceName) => {
          if (serviceName === 'searchService') {
            return { search: mockPluginSearch };
          }
          return null;
        }),
      };
    }
    return null;
  }),
};

describe('UnifiedSearchService Proxy Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as unknown as { strapi: typeof mockStrapi }).strapi = mockStrapi;
  });

  it('should delegate search to semantic-search plugin', async () => {
    const mockResults = [{ id: 1, title: 'Test Result' }];
    mockPluginSearch.mockResolvedValue(mockResults);

    const results = await unifiedSearchService.search('test query', { limit: 10, targets: ['spell'] });

    expect(mockStrapi.plugin).toHaveBeenCalledWith('semantic-search');
    expect(mockPluginSearch).toHaveBeenCalledWith({
      query: 'test query',
      targets: ['spell'],
      limit: 10,
    });
    expect(results).toEqual(mockResults);
  });

  it('should handle plugin missing gracefully', async () => {
    // Mock plugin returning null
    (mockStrapi.plugin as unknown as Mock).mockReturnValueOnce({ service: () => null });

    const results = await unifiedSearchService.search('test');
    expect(results).toEqual([]);
    expect(mockStrapi.log.error).toHaveBeenCalled();
  });

  it('should handle service errors gracefully', async () => {
    mockPluginSearch.mockRejectedValue(new Error('Plugin Error'));
    const results = await unifiedSearchService.search('test');
    expect(results).toEqual([]);
    expect(mockStrapi.log.error).toHaveBeenCalled();
  });
});
