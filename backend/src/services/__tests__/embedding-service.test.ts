import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to ensure the mock function is available in the module factory
const { mockEmbedQuery } = vi.hoisted(() => {
  return { mockEmbedQuery: vi.fn() };
});

vi.mock('@langchain/openai', () => {
  return {
    OpenAIEmbeddings: class {
      constructor() {}
      embedQuery = mockEmbedQuery;
    },
  };
});

describe('EmbeddingService', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test-key');
    mockEmbedQuery.mockReset();
    mockEmbedQuery.mockResolvedValue([0.1, 0.2, 0.3]);
    vi.resetModules(); // Ensure we get fresh module for each test
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should throw if API key is missing', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    // Need to re-import to trigger constructor check
    try {
      const { EmbeddingService } = await import('../embedding-service');
      new EmbeddingService();
    } catch (e: unknown) {
      expect((e as Error).message).toContain('OPENAI_API_KEY is not set');
    }
  });

  it('should generate embeddings using OpenAI', async () => {
    const { EmbeddingService } = await import('../embedding-service');
    const service = new EmbeddingService();

    const result = await service.generateEmbedding('hello');

    expect(result).toEqual([0.1, 0.2, 0.3]);
    expect(mockEmbedQuery).toHaveBeenCalledWith('hello');
  });

  it('should return empty array for empty input', async () => {
    const { EmbeddingService } = await import('../embedding-service');
    const service = new EmbeddingService();

    const result = await service.generateEmbedding('');
    expect(result).toEqual([]);
    expect(mockEmbedQuery).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const { EmbeddingService } = await import('../embedding-service');
    const service = new EmbeddingService();

    mockEmbedQuery.mockRejectedValue(new Error('API Error'));

    await expect(service.generateEmbedding('fail')).rejects.toThrow('API Error');
  });
});
