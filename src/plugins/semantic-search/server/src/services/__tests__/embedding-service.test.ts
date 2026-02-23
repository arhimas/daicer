
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import embeddingServiceFactory from '@/plugins/semantic-search/server/src/services/embedding-service';

// Mock Transformers
const mockPipeline = vi.fn();
const mockEnv = { cacheDir: '', allowLocalModels: false };
const mockPipelineInstance = vi.fn();

// Mock Strapi
const mockLogInfo = vi.fn();
const mockLogError = vi.fn();

const mockStrapi = {
  log: {
    info: mockLogInfo,
    error: mockLogError,
  },
} as any;

describe('Embedding Service', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset service factory for each test to clear internal state (pipelineInstance)
    service = embeddingServiceFactory({ strapi: mockStrapi });
    
    // Setup Mock Transformers
    mockPipelineInstance.mockResolvedValue({
        tolist: () => [[0.1, 0.2, 0.3]]
    });
    mockPipeline.mockResolvedValue(mockPipelineInstance);

    // Mock dynamic import
    vi.doMock('@huggingface/transformers', () => ({
        pipeline: mockPipeline,
        env: mockEnv
    }));
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('init', () => {
    it('should initialize pipeline successfully', async () => {
      await service.init();
      
      expect(mockPipeline).toHaveBeenCalledWith('feature-extraction', 'Xenova/jina-embeddings-v2-small-en', expect.any(Object));
      expect(service.pipelineInstance).toBeDefined();
      expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('Model Ready'));
      expect(mockEnv.allowLocalModels).toBe(true);
    });

    it('should not re-initialize if already initialized', async () => {
      service.pipelineInstance = {}; // Fake ready state
      await service.init();
      expect(mockPipeline).not.toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      mockPipeline.mockRejectedValue(new Error('Import Failed'));
      await expect(service.init()).rejects.toThrow('Import Failed');
      expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Failed to initialize'), expect.any(Error));
    });
  });

  describe('generateEmbedding', () => {
      it('should return empty array for empty text', async () => {
          const result = await service.generateEmbedding('');
          expect(result).toEqual([]);
          expect(mockPipeline).not.toHaveBeenCalled();
      });

      it('should generate embedding for valid text', async () => {
          const vector = await service.generateEmbedding('Hello World');
          
          expect(mockPipelineInstance).toHaveBeenCalledWith('Hello World', { pooling: 'mean', normalize: true });
          expect(vector).toEqual([0.1, 0.2, 0.3]);
      });

      it('should handle pipeline execution errors', async () => {
          mockPipelineInstance.mockRejectedValue(new Error('Inference Error'));
          
          const result = await service.generateEmbedding('Crash');
          
          expect(result).toEqual([]);
          expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Embedding Generation Failed'), 'Inference Error');
      });
      
      it('should handle uninitialized state gracefully (though generate calls init)', async () => {
          // If init fails silently or returns early without setting instance (unlikely code path but possible via mutation)
          // Actually generateEmbedding calls init(), so checking initialization failure case propagation
           mockPipeline.mockRejectedValueOnce(new Error('Init Fail'));
           
           const result = await service.generateEmbedding('test');
           expect(result).toEqual([]); // catch block in generateEmbedding
      });
  });
});
