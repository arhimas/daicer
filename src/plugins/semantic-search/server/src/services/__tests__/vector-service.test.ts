
import { describe, it, expect, vi, beforeEach } from 'vitest';
import vectorServiceFactory from '@/plugins/semantic-search/server/src/services/vector-service';

// Mock Knex Chain
const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  leftJoin: vi.fn().mockReturnThis(),
  whereNotNull: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  orderByRaw: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  then: vi.fn(), // For Promise compatibility if needed, though usually we await the chain
};

// Mock Connection Function
const mockConnection = vi.fn(() => mockQueryBuilder) as any;
mockConnection.raw = vi.fn((sql, bindings) => ({ sql, bindings })); // Simple raw mock
mockConnection.client = {
  config: {
    client: 'better-sqlite3', // Default to sqlite
  },
};

// Mock Strapi
const mockMetadataGet = vi.fn();
const mockLogError = vi.fn();

const mockStrapi = {
  db: {
    connection: mockConnection,
    metadata: {
      get: mockMetadataGet,
    },
  },
  log: {
    error: mockLogError,
  },
} as any;

describe('Vector Service', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = vectorServiceFactory({ strapi: mockStrapi });
    
    // Reset client to sqlite by default
    mockConnection.client.config.client = 'better-sqlite3';

    // Default Metadata Mocks
    mockMetadataGet.mockImplementation((uid) => {
      if (uid === 'api::knowledge-snippet.knowledge-snippet') {
        return {
          tableName: 'snippets',
          attributes: {
            source: {
              joinTable: {
                name: 'snippets_sources_links',
                joinColumn: { name: 'snippet_id' },
                inverseJoinColumn: { name: 'source_id' },
              },
            },
          },
        };
      }
      if (uid === 'api::knowledge-source.knowledge-source') {
        return { tableName: 'sources' };
      }
      return { tableName: 'entities' };
    });
    
    // Mock Query Resolution
    mockQueryBuilder.limit.mockResolvedValue([]);
  });

  describe('searchManual', () => {
    const vector = [0.1, 0.2, 0.3];

    it('should execute SQLite query with manual join', async () => {
      mockConnection.client.config.client = 'better-sqlite3';
      
      const results = [{ id: 1, distance: 0.1 }];
      mockQueryBuilder.limit.mockResolvedValue(results);

      const response = await service.searchManual(vector);
      
      expect(mockConnection).toHaveBeenCalledWith('snippets');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'snippets_sources_links', 
        'snippets.id', 
        'snippets_sources_links.snippet_id'
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('distance', 'asc');
      
      // Verify score calculation
      expect(response[0].score).toBe(0.9);
    });

    it('should execute Postgres query with pgvector syntax', async () => {
      mockConnection.client.config.client = 'postgres';
      
      const results = [{ id: 1, score: 0.9 }]; // PG returns score directly in logic if adapted, but here service returns raw result
      // Wait, service logic for PG: returns result directly.
      mockQueryBuilder.limit.mockResolvedValue(results);

      const response = await service.searchManual(vector);
      
      expect(mockConnection).toHaveBeenCalledWith('snippets');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('score', 'desc');
      expect(response).toEqual(results);
    });
    
    it('should handle missing joinTable (fallback logic)', async () => {
        mockMetadataGet.mockImplementation((uid) => {
            if (uid === 'api::knowledge-snippet.knowledge-snippet') {
                return {
                    tableName: 'snippets',
                    attributes: {
                        source: {
                            // No joinTable, simulating joinColumn
                            joinColumn: { name: 'source_fk' }
                        }
                    }
                };
            }
             if (uid === 'api::knowledge-source.knowledge-source') {
                return { tableName: 'sources' };
            }
            return { tableName: 'entities' };
        });
        
        await service.searchManual(vector);
        expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('sources', 'snippets.source_fk', 'sources.id');
    });

    it('should handle errors gracefully', async () => {
      mockQueryBuilder.limit.mockRejectedValue(new Error('DB Error'));
      const response = await service.searchManual(vector);
      expect(response).toEqual([]);
      expect(mockLogError).toHaveBeenCalled();
    });
  });

  describe('searchEntity', () => {
     const vector = [0.1, 0.2, 0.3];
     const uid = 'api::test.test';

     it('should execute SQLite entity search', async () => {
         mockConnection.client.config.client = 'sqlite';
         mockQueryBuilder.limit.mockResolvedValue([{ id: 1, distance: 0.2 }]);
         
         const response = await service.searchEntity(uid, vector);
         
         expect(mockConnection).toHaveBeenCalledWith('entities');
         expect(mockQueryBuilder.whereNotNull).toHaveBeenCalledWith('embedding');
         expect(response[0].score).toBe(0.8);
     });

     it('should execute Postgres entity search', async () => {
         mockConnection.client.config.client = 'postgres';
         mockQueryBuilder.limit.mockResolvedValue([{ id: 1, score: 0.8 }]);
         
         const response = await service.searchEntity(uid, vector);
         
         expect(mockConnection).toHaveBeenCalledWith('entities');
         expect(mockQueryBuilder.orderByRaw).toHaveBeenCalled();
         expect(response[0].score).toBe(0.8);
     });

     it('should handle errors', async () => {
         mockQueryBuilder.limit.mockRejectedValue(new Error('Fail'));
         const response = await service.searchEntity(uid, vector);
         expect(response).toEqual([]);
         expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Vector Service'), 'Fail');
     });
  });
});
