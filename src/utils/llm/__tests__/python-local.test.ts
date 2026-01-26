
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localLLM } from '../local';
import { LocalModel } from '../types';

// Mock PythonBridge
// Hoist mocks
const { mockLoadModel, mockGenerate } = vi.hoisted(() => ({
  mockLoadModel: vi.fn(),
  mockGenerate: vi.fn(),
}));

vi.mock('../python-bridge', () => {
  return {
    PythonBridge: vi.fn(function() {
      return {
        loadModel: mockLoadModel,
        generate: mockGenerate,
      };
    })
  };
});

describe('LocalLLMManager (Python Bridge)', () => {
  beforeEach(() => {
    localLLM.reset();
    vi.clearAllMocks();
    mockLoadModel.mockResolvedValue('Model Loaded');
    mockGenerate.mockResolvedValue('Generated Text');
  });

  it('should be a singleton', () => {
    const instance1 = localLLM;
    // @ts-expect-error: Private access for testing singleton
    const instance2 = localLLM.constructor.getInstance ? localLLM.constructor.getInstance() : localLLM;
    expect(instance1).toBe(instance2);
  });

  it('should call bridge.loadModel with correct mapping for 1B model', async () => {
      await localLLM.loadModel(LocalModel.GEMMA_3_1B_IT);
      expect(mockLoadModel).toHaveBeenCalledWith('google/gemma-3-1b-it', '4bit');
  });

  it('should call bridge.loadModel with correct mapping for 27B model', async () => {
      await localLLM.loadModel(LocalModel.GEMMA_3_27B_IT, 'int8');
      expect(mockLoadModel).toHaveBeenCalledWith('google/gemma-3-27b-it', '8bit'); // Our map converts int8->8bit
  });

  it('should auto-load default model if generate called without loading', async () => {
      await localLLM.generate("Hello");
      // Should have loaded default (GEMMA_3N_1B_IT -> 'google/gemma-3n-1b-it')
      expect(mockLoadModel).toHaveBeenCalledWith('google/gemma-3n-1b-it', expect.any(String)); // Default is q4->4bit
      expect(mockGenerate).toHaveBeenCalled();
  });

  it('should not reload model if already loaded', async () => {
      await localLLM.loadModel(LocalModel.GEMMA_3_1B_IT);
      expect(mockLoadModel).toHaveBeenCalledTimes(1);
      
      await localLLM.loadModel(LocalModel.GEMMA_3_1B_IT);
      expect(mockLoadModel).toHaveBeenCalledTimes(1); // Should assume same state
  });

  it('should pass generation params to bridge', async () => {
      await localLLM.loadModel(LocalModel.GEMMA_3_1B_IT);
      await localLLM.generate("Test Prompt", { maxTokens: 100, temperature: 0.5 });
      
      expect(mockGenerate).toHaveBeenCalledWith("Test Prompt", 100, 0.5);
  });
});
