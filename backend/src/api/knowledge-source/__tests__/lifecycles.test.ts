import { describe, it, expect, vi, beforeEach } from 'vitest';
import knowledgeLifecycles from '../content-types/knowledge-source/lifecycles';
import { chunkMarkdown } from '../../../shared';

// Mock Dependencies
const { mockGenerateEmbedding, mockDeleteMany, mockCreate } = vi.hoisted(() => ({
  mockGenerateEmbedding: vi.fn(),
  mockDeleteMany: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock('../../../services/embedding-service', () => ({
  embeddingService: {
    generateEmbedding: mockGenerateEmbedding,
  },
}));

// Ensure @daicer/shared is mocked cleanly
vi.mock('../../../shared', () => ({
  chunkMarkdown: vi.fn(),
}));

vi.stubGlobal('strapi', {
  db: {
    query: () => ({ deleteMany: mockDeleteMany }),
  },
  entityService: {
    create: mockCreate,
  },
  log: {
    info: vi.fn(),
    error: vi.fn(),
  },
});

describe('Knowledge Source Lifecycles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('afterCreate', () => {
    it('should sync knowledge source on create with content', async () => {
      // Direct mock manipulation on the imported symbol
      (chunkMarkdown as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
        { title: 'Chunk 1', content: 'Content A is definitely long enough now' },
        { title: 'Chunk 2', content: 'Content B is also very long indeed' },
      ]);
      mockGenerateEmbedding.mockResolvedValue([0.1, 0.2]);

      const event = {
        result: { id: 101, content: '# Full Doc', name: 'Rulebook' },
      };

      await knowledgeLifecycles.afterCreate(event as unknown);

      expect(mockDeleteMany).toHaveBeenCalledWith({ where: { source: 101 } });
      expect(mockGenerateEmbedding).toHaveBeenCalledTimes(2);
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should skip sync if no content', async () => {
      const event = { result: { id: 102, name: 'Empty' } };
      await knowledgeLifecycles.afterCreate(event as unknown);
      expect(chunkMarkdown).not.toHaveBeenCalled();
    });
  });
});
