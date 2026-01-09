import { describe, it, expect, vi, beforeEach } from 'vitest';
import vectorServiceFactory from '../vector-service';

// Mock Strapi
const mockRaw = vi.fn();
const mockMetadataGet = vi.fn();
const mockLog = { error: vi.fn(), info: vi.fn() };

const strapi = {
  db: {
    connection: { raw: mockRaw },
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
    mockRaw.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const vector = [0.1, 0.2, 0.3];
    await service.searchManual(vector, 5);

    expect(mockRaw).toHaveBeenCalledTimes(1);
    const sql = mockRaw.mock.calls[0][0];
    const params = mockRaw.mock.calls[0][1];
    expect(sql).toContain('knowledge_snippets');
    expect(sql).toContain('<=> ?'); // PGVector operator check
    expect(sql).toContain('ORDER BY ((ks.embedding::text)::vector <=> ?) ASC');
    expect(params[0]).toBe('[0.1,0.2,0.3]');
  });

  it('searchEntity should inspect metadata and use correct table', async () => {
    mockMetadataGet.mockReturnValue({ tableName: 'custom_spells' });
    mockRaw.mockResolvedValueOnce({ rows: [] });

    const vector = [0.9];
    await service.searchEntity('api::spell.spell', vector, 10);

    expect(mockMetadataGet).toHaveBeenCalledWith('api::spell.spell');
    const sql = mockRaw.mock.calls[0][0];
    expect(sql).toContain('FROM custom_spells');
    expect(sql).toContain('<=> ?'); // Relaxed check
  });
});
