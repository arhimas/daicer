import { describe, it, expect, vi, beforeEach } from 'vitest';
import { localLLM } from '@/utils/llm/local';

describe('LocalLLMManager (Stub)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('loadModel should log warning', async () => {
    await localLLM.loadModel('any-model');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('pending replacement'), expect.any(Object));
  });

  it('generate should return disabled message', async () => {
    const result = await localLLM.generate('prompt');
    expect(result).toBe('Local LLM disabled.');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('pending replacement'), expect.any(Object));
  });

  it('reset should do nothing', () => {
    expect(() => localLLM.reset()).not.toThrow();
  });
});
