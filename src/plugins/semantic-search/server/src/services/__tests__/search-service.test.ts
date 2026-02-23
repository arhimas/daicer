import { describe, it, expect, vi, beforeEach } from 'vitest';
import searchServiceFactory from '@/plugins/semantic-search/server/src/services/search-service';

// Mocks
const mockGenerateEmbedding = vi.fn();
const mockSearchManual = vi.fn();
const mockSearchEntity = vi.fn();
const mockFindMany = vi.fn();
const mockLogError = vi.fn();

const mockStrapi = {
  plugin: vi.fn((name) => {
    if (name === 'semantic-search') {
      return {
        service: vi.fn((serviceName) => {
          if (serviceName === 'embeddingService') return { generateEmbedding: mockGenerateEmbedding };
          if (serviceName === 'vectorService')
            return { searchManual: mockSearchManual, searchEntity: mockSearchEntity };
        }),
      };
    }
  }),
  entityService: {
    findMany: mockFindMany,
  },
  log: {
    error: mockLogError,
  },
} as any;

describe('Search Service', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = searchServiceFactory({ strapi: mockStrapi });

    // Defaults
    mockGenerateEmbedding.mockResolvedValue([0.1, 0.2]);
    mockSearchManual.mockResolvedValue([]);
    mockSearchEntity.mockResolvedValue([]);
    mockFindMany.mockResolvedValue([]);
  });

  it('should return empty if query is missing', async () => {
    const result = await service.search({ query: '' });
    expect(result).toEqual([]);
    expect(mockGenerateEmbedding).not.toHaveBeenCalled();
  });

  it('should return empty if embedding generation fails', async () => {
    mockGenerateEmbedding.mockResolvedValue([]);
    const result = await service.search({ query: 'test' });
    expect(result).toEqual([]);
  });

  it('should search manuals if included in targets or searchAll', async () => {
    mockSearchManual.mockResolvedValue([
      { id: 1, title: 'Doc', content: 'Excerpt', score: 0.9, source_name: 'Source', source_id: 10 },
    ]);

    // Search All (default)
    const result = await service.search({ query: 'test' });
    expect(mockSearchManual).toHaveBeenCalled();
    expect(result).toContainEqual(
      expect.objectContaining({
        id: 'manual-1',
        kind: 'knowledge',
        sourceName: 'Source',
      })
    );
  });

  it('should skip manual search if targets excluded it', async () => {
    await service.search({ query: 'test', targets: ['spell'] });
    expect(mockSearchManual).not.toHaveBeenCalled();
  });

  it('should search entities defined in aliases', async () => {
    // spell -> api::spell.spell
    mockSearchEntity.mockResolvedValue([{ id: 1, score: 0.8 }]);
    mockFindMany.mockResolvedValue([{ id: 1, name: 'Fireball', description: 'Boom' }]);

    const result = await service.search({ query: 'test', targets: ['spell'] });

    expect(mockSearchEntity).toHaveBeenCalledWith('api::spell.spell', expect.any(Array), 5);
    expect(mockFindMany).toHaveBeenCalledWith(
      'api::spell.spell',
      expect.objectContaining({
        filters: { id: { $in: [1] } },
      })
    );

    expect(result).toContainEqual(
      expect.objectContaining({
        id: 1,
        title: 'Fireball',
        kind: 'entity',
        entityUid: 'api::spell.spell',
      })
    );
  });

  it('should handle entity search errors gracefully', async () => {
    mockSearchEntity.mockRejectedValue(new Error('Vector DB Fail'));

    const result = await service.search({ query: 'test', targets: ['spell'] });

    expect(result).toEqual([]);
    expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Entity Search Step Failed'), expect.any(Error));
  });

  it('should handle manual search errors gracefully', async () => {
    mockSearchManual.mockRejectedValue(new Error('Manual Fail'));

    const result = await service.search({ query: 'test', targets: ['manual'] });

    expect(result).toEqual([]);
    expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Manual Search Step Failed'), expect.any(Error));
  });

  it('should sort results by score', async () => {
    mockSearchManual.mockResolvedValue([{ id: 1, content: 'A', score: 0.5 }]);

    mockSearchEntity.mockImplementation((uid) => {
      if (uid === 'api::spell.spell') return [{ id: 2, score: 0.9 }];
    });
    mockFindMany.mockResolvedValue([{ id: 2, name: 'B' }]);

    const result = await service.search({ query: 'test', targets: ['manual', 'spell'] });

    expect(result).toHaveLength(2);
    expect(result[0].score).toBe(0.9); // Higher score first
    expect(result[1].score).toBe(0.5);
  });
});
