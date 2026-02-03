import { EmbeddingService } from '@/services/embedding-service';
import { pipeline } from '@huggingface/transformers';

vi.mock('@huggingface/transformers', () => {
  return {
    pipeline: vi.fn(),
    env: { cacheDir: '' },
    FeatureExtractionPipeline: vi.fn(),
  };
});

describe('EmbeddingService (Local Transformers)', () => {
  let mockPipeline: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock pipeline function
    mockPipeline = vi.fn().mockImplementation(async (_text) => {
      // Mock return object from transformers.js pipeline
      return {
        tolist: () => [[0.1, 0.2, 0.3]],
      };
    });

    vi.mocked(pipeline).mockResolvedValue(mockPipeline);
  });

  it('should initialize pipeline on first request', async () => {
    const service = new EmbeddingService();
    // Reset instance state if needed or rely on new instance

    // First call triggers init
    const result = await service.generateEmbedding('test');

    expect(pipeline).toHaveBeenCalledWith(
      'feature-extraction',
      'Xenova/jina-embeddings-v2-small-en',
      expect.any(Object)
    );
    expect(mockPipeline).toHaveBeenCalledWith('test', expect.any(Object));
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it('should reuse pipeline for subsequent requests', async () => {
    const service = new EmbeddingService();

    await service.generateEmbedding('test1');
    await service.generateEmbedding('test2');

    // pipeline factory should be called once per instance (if singleton logic holds, but we are newing it up)
    // Actually our exported service is a singleton, but tests new up the class.
    // The class lacks a static 'instance' check inside the constructor, so new EmbeddingService() creates new internal state,
    // but the `pipeline` var is instance scoped. So 1 init per instance.
    expect(pipeline).toHaveBeenCalledTimes(1);
    expect(mockPipeline).toHaveBeenCalledTimes(2);
  });

  it('should handle pipeline errors', async () => {
    const service = new EmbeddingService();

    mockPipeline.mockRejectedValue(new Error('Model Error'));

    await expect(service.generateEmbedding('fail')).rejects.toThrow('Model Error');
  });

  it('should return empty for empty input', async () => {
    const service = new EmbeddingService();
    const result = await service.generateEmbedding('');
    expect(result).toEqual([]);
    expect(pipeline).not.toHaveBeenCalled();
  });
});
