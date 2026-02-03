import { describe, it, expect, vi, beforeEach } from 'vitest';
import { localLLM } from '@/utils/llm/local';
import { LocalModel } from '@/utils/llm/types';

// Mock @huggingface/transformers
const mockPipeline = vi.fn();
vi.mock('@huggingface/transformers', () => ({
  env: { cacheDir: '', allowLocalModels: false },
  pipeline: (task: string, model: string, opts: unknown) => mockPipeline(task, model, opts),
}));

describe('LocalLLMManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localLLM.reset();
  });

  it.skip('should initialize pipeline on first generate call', async () => {
    const mockGenerator = vi.fn().mockResolvedValue([{ generated_text: 'Mock output' }]);
    mockPipeline.mockResolvedValue(mockGenerator);

    const result = await localLLM.generate('Hello');

    expect(mockPipeline).toHaveBeenCalledWith('text-generation', expect.stringContaining('gemma'), expect.any(Object));
    expect(mockGenerator).toHaveBeenCalled();
    expect(result).toBe('Mock output');
  });

  it.skip('should reuse pipeline for subsequent calls', async () => {
    const mockGenerator = vi.fn().mockResolvedValue([{ generated_text: 'Mock output' }]);
    mockPipeline.mockResolvedValue(mockGenerator);

    await localLLM.generate('First');
    await localLLM.generate('Second');

    // Should be called once for initialization (or previous test might have init it)
    // Since Vitest isolates files but not singletons across tests in same file unless we reset modules
    // We check if it *uses* the pipeline.
    expect(mockGenerator).toHaveBeenCalledTimes(2);
  });

  it.skip('should respect model switching', async () => {
    const mockGenerator = vi.fn().mockResolvedValue([{ generated_text: 'Switched' }]);
    mockPipeline.mockResolvedValue(mockGenerator);

    // Explicitly load a different model
    await localLLM.loadModel(LocalModel.GEMMA_3_27B_IT);

    expect(mockPipeline).toHaveBeenCalledWith(
      'text-generation',
      'google/gemma-3-27b-it',
      expect.objectContaining({ dtype: 'q8' })
    );
  });
});
