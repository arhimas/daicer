import { describe, it, expect, vi, beforeEach } from 'vitest';
import vectorServiceFactory from '@/plugins/semantic-search/server/src/services/vector-service';

// Mock Strapi
const mockRaw = vi.fn();
const mockMetadataGet = vi.fn();
const mockLog = { error: vi.fn(), info: vi.fn() };

// Mock Knex Chain
const mockSelect = vi.fn().mockReturnThis();
const mockWhereNotNull = vi.fn().mockReturnThis();
const mockOrderBy = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();
const mockLeftJoin = vi.fn().mockReturnThis();
const mockOrderByRaw = vi.fn().mockReturnThis();

// The connection function itself needs to return the chain
const mockConnection = vi.fn(() => ({
  select: mockSelect,
  whereNotNull: mockWhereNotNull,
  orderBy: mockOrderBy,
  limit: mockLimit,
  leftJoin: mockLeftJoin,
  orderByRaw: mockOrderByRaw,
}));

// Attach raw and client to the connection object (Strapi style)
mockConnection.raw = mockRaw;
mockConnection.client = { config: { client: 'pg' } };

const strapi = {
  db: {
    connection: mockConnection,
    metadata: { get: mockMetadataGet },
  },
  log: mockLog,
};

describe('Vector Service (Plugin)', () => {
  const service = vectorServiceFactory({ strapi });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searchManual should construct correct SQL with pgvector operator', async () => {
    // Setup Metadata
    mockMetadataGet.mockImplementation((uid) => {
      if (uid === 'api::knowledge-snippet.knowledge-snippet') {
        return {
          tableName: 'knowledge_snippets',
          attributes: { source: { joinColumn: { name: 'source_id' } } },
        };
      }
      if (uid === 'api::knowledge-source.knowledge-source') {
        return { tableName: 'knowledge_sources' };
      }
      return {};
    });

    // Setup Knex execution result
    // The chain ends with .limit(limit), so that mock should resolve
    mockLimit.mockResolvedValueOnce([{ id: 1, score: 0.9 }]);

    const vector = [0.1, 0.2, 0.3];
    await service.searchManual(vector, 5);

    // Verify calls
    expect(mockConnection).toHaveBeenCalledWith('knowledge_snippets');

    // Verify Raw SQL generation for Postgres
    // The code calls connection.raw(...) inside select()
    const rawCalls = mockRaw.mock.calls;
    const vectorSqlCall = rawCalls.find((call) => call[0].includes('<=>'));
    expect(vectorSqlCall).toBeDefined();
    expect(vectorSqlCall[0]).toContain('1 - ((??::text)::vector <=> ?) as score');
    expect(vectorSqlCall[1][1]).toBe('[0.1,0.2,0.3]');
  });

  it('searchEntity should inspect metadata and use correct table', async () => {
    mockMetadataGet.mockReturnValue({ tableName: 'custom_spells' });

    // Mock limit resolution
    mockLimit.mockResolvedValueOnce([]);

    const vector = [0.9];
    await service.searchEntity('api::spell.spell', vector, 10);

    expect(mockMetadataGet).toHaveBeenCalledWith('api::spell.spell');
    expect(mockConnection).toHaveBeenCalledWith('custom_spells');

    // Check raw calls for vector calc
    const rawCalls = mockRaw.mock.calls;
    const vectorSqlCall = rawCalls.find((call) => call[0].includes('<=>'));
    expect(vectorSqlCall).toBeDefined();
    expect(vectorSqlCall[1][0]).toContain('0.9');
  });
});
