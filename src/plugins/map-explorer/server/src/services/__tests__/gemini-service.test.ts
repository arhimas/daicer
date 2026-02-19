
import { describe, it, expect, vi, beforeEach } from 'vitest';
import geminiServiceFactory from '../gemini-service';

// Mock Dependencies
vi.mock('@daicer/llm-core', () => ({
  GeminiService: vi.fn(() => ({ generate: vi.fn() }))
}));

import { GeminiService } from '@daicer/llm-core';

const mockFindOne = vi.fn();
const mockFetchContext = vi.fn();

const mockStrapi: any = {
  log: { info: vi.fn() },
  db: {},
  getModel: vi.fn(),
  plugin: vi.fn(() => ({
    service: vi.fn((name) => {
        if (name === 'contextService') return { fetchDeepContext: mockFetchContext };
        return {};
    }),
    config: vi.fn(() => ({ types: [] }))
  })),
};

describe('Gemini Service', () => {
    let service: any;

    beforeEach(() => {
        vi.clearAllMocks();
        service = geminiServiceFactory({ strapi: mockStrapi });
    });

    it('should initialize LLM Core with adapter', () => {
        expect(GeminiService).toHaveBeenCalled();
        const callArgs = vi.mocked(GeminiService).mock.calls[0][0];
        expect(callArgs.adapter).toBeDefined();
        expect(callArgs.config).toBeDefined();
    });

    it('should wire up fetchContext in adapter', async () => {
        const callArgs = vi.mocked(GeminiService).mock.calls[0][0];
        const adapter = callArgs.adapter;
        
        mockFetchContext.mockResolvedValue({ id: 1 });
        const res = await adapter.fetchContext('uid', 'doc1');
        
        expect(mockFetchContext).toHaveBeenCalledWith('uid', 'doc1');
        expect(res).toEqual({ id: 1 });
    });
});
